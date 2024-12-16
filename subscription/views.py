from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SubscriptionPackage, UserSubscription, UsageTracking, SubscriptionHistory
from .serializers import SubscriptionPackageSerializer, UserSubscriptionSerializer
from quiz.permissions import IsAdmin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from datetime import timedelta



class SubscriptionPackageListCreateView(generics.ListCreateAPIView):
    queryset = SubscriptionPackage.objects.all()
    serializer_class = SubscriptionPackageSerializer
    authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAdmin]
    
    def create(self, request, *args, **kwargs):
        print("Request Data:", request.data)  # Debug incoming data
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                validated_data = serializer.validated_data
                print("Validated Data:", validated_data)  # Debug validated data
                package = SubscriptionPackage(**validated_data)
                package.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        print("Errors:", serializer.errors)  # Debug validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class SubscriptionPackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubscriptionPackage.objects.all()
    serializer_class = SubscriptionPackageSerializer

    def update(self, request, *args, **kwargs):
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            # print("hello, world")
            try:
                package = SubscriptionPackage(**serializer.validated_data)
                # package.validate_percentages()  # Validate total percentage
                self.perform_update(serializer)
                return Response(serializer.data)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionPackageActionView(generics.GenericAPIView):
    queryset = SubscriptionPackage.objects.all()
    serializer_class = SubscriptionPackageSerializer

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a subscription package."""
        package = self.get_object()
        package.is_active = True  # Assuming there's an 'is_active' field
        package.save()
        return Response({"detail": "Package activated successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a subscription package."""
        package = self.get_object()
        package.is_active = False  # Assuming there's an 'is_active' field
        package.save()
        return Response({"detail": "Package deactivated successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def apply_discount(self, request, pk=None):
        """Apply a discount to the subscription package."""
        package = self.get_object()
        discount_percentage = request.data.get("discount_percentage", 0)

        if 0 <= discount_percentage <= 100:
            discount_amount = (discount_percentage / 100) * package.price
            package.price -= discount_amount
            package.save()
            return Response({"detail": f"Discount applied successfully. New price: ${package.price:.2f}"}, status=status.HTTP_200_OK)
        return Response({"detail": "Invalid discount percentage."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        """Generate a report for the subscription package."""
        package = self.get_object()
        report_data = {
            "name": package.name,
            "price": package.price,
            "duration": package.duration_in_days,
            "max_exams": package.max_exams,
            "difficulty_distribution": {
                "very_easy": package.very_easy_percentage,
                "easy": package.easy_percentage,
                "medium": package.medium_percentage,
                "hard": package.hard_percentage,
                "very_hard": package.very_hard_percentage,
                "expert": package.expert_percentage,
            },
        }
        return Response(report_data, status=status.HTTP_200_OK)


class BuyPackageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        List all available subscription packages.
        """
        packages = SubscriptionPackage.objects.all()
        serializer = SubscriptionPackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Handle the purchase or update of a subscription package.
        """
        package_id = request.data.get('package_id')
        if not package_id:
            return Response({'error': 'Package ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            package = SubscriptionPackage.objects.get(id=package_id)
        except SubscriptionPackage.DoesNotExist:
            return Response({'error': 'Package not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user already has an active subscription
        active_subscription = UserSubscription.objects.filter(user=request.user, status='active').first()

        if active_subscription:
            # Update the existing subscription
            new_end_date = now().date() + timedelta(days=package.duration_in_days)
            active_subscription.package = package
            active_subscription.end_date = new_end_date
            active_subscription.save()

            # Update usage tracking
            usage_tracking = UsageTracking.objects.filter(user=request.user).first()
            if usage_tracking:
                usage_tracking.total_exams_taken = 0  # Reset total exams
                usage_tracking.total_attempts_taken = 0  # Reset total attempts
                usage_tracking.package = package
                # Reset `exam_attempts` for the new subscription
                usage_tracking.exam_attempts = {}  # Clear all previous attempts
                usage_tracking.save()

            # Record subscription history
            SubscriptionHistory.objects.create(
                user=request.user,
                package=package,
                start_date=now().date(),
                end_date=new_end_date
            )

            return Response(
                {'message': f'Successfully updated your subscription to the {package.get_name_display()} package!'},
                status=status.HTTP_200_OK
            )
        else:
            # Create a new subscription
            end_date = now().date() + timedelta(days=package.duration_in_days)

            subscription = UserSubscription.objects.create(
                user=request.user,
                package=package,
                start_date=now().date(),
                end_date=end_date,
                status='active',
                auto_renew=True
            )

            # Create usage tracking
            UsageTracking.objects.create(
                user=request.user,
                package=package,
                total_exams_taken=0,
                total_attempts_taken=0,
                exam_attempts={}  # Initialize as an empty dictionary
            )

            # Record subscription history
            SubscriptionHistory.objects.create(
                user=request.user,
                package=package,
                start_date=now().date(),
                end_date=end_date
            )

            return Response(
                {'message': f'Successfully purchased the {package.get_name_display()} package!'},
                status=status.HTTP_201_CREATED
            )
