from rest_framework import serializers
from .models import (
    SubscriptionPackage,
    UserSubscription,
    Payment,
    UsageTracking,
    Coupon
)
import re
class SubscriptionPackageSerializer(serializers.ModelSerializer):
    # Declare individual fields for the percentages (these are directly input fields)
    very_easy_percentage = serializers.CharField(max_length=10, required=True)
    easy_percentage = serializers.CharField(max_length=10, required=True)
    medium_percentage = serializers.CharField(max_length=10, required=True)
    hard_percentage = serializers.CharField(max_length=10, required=True)
    very_hard_percentage = serializers.CharField(max_length=10, required=True)
    expert_percentage = serializers.CharField(max_length=10, required=True)

    class Meta:
        model = SubscriptionPackage
        fields = [
            'id',
            'name',
            'price',
            'duration_in_days',
            'max_exams',
            'max_attampts',
            'very_easy_percentage',
            'easy_percentage',
            'medium_percentage',
            'hard_percentage',
            'very_hard_percentage',
            'expert_percentage'
        ]

    def validate(self, attrs):
        """
        Custom validation for the percentage fields to ensure they are valid ranges (0-100).
        """
        very_easy_percentage = attrs.get('very_easy_percentage', '')
        easy_percentage = attrs.get('easy_percentage', '')
        medium_percentage = attrs.get('medium_percentage', '')
        hard_percentage = attrs.get('hard_percentage', '')
        very_hard_percentage = attrs.get('very_hard_percentage', '')
        expert_percentage = attrs.get('expert_percentage', '')

        # Validate percentage ranges
        percentage_fields = {
            'very_easy_percentage': very_easy_percentage,
            'easy_percentage': easy_percentage,
            'medium_percentage': medium_percentage,
            'hard_percentage': hard_percentage,
            'very_hard_percentage': very_hard_percentage,
            'expert_percentage': expert_percentage,
        }

        for key, value in percentage_fields.items():
            # Ensure the value is a valid range in the format "min-max"
            if '-' not in value:
                raise serializers.ValidationError(f"{key.replace('_', ' ').capitalize()} must be in the format 'min-max'.")
            
            try:
                min_value, max_value = map(int, value.split('-'))  # Split the range into min and max
            except ValueError:
                raise serializers.ValidationError(f"{key.replace('_', ' ').capitalize()} must be a valid range with integers (e.g., '10-20').")

            # Check that the range is valid (0 <= min < max <= 100)
            if min_value < 0 or max_value > 100 or min_value >= max_value:
                raise serializers.ValidationError(f"{key.replace('_', ' ').capitalize()} must be a valid range: 0 <= min < max <= 100.")

        # Optional: Implement logic to find matching exams based on the given ranges

        return attrs


    def create(self, validated_data):
        """
        Override create method to handle creation of a SubscriptionPackage instance.
        """
        instance = SubscriptionPackage(**validated_data)

        # Perform model-level validation and save the instance
        instance.full_clean()  # Validates the model instance
        instance.save()

        return instance

    def update(self, instance, validated_data):
        """
        Override update method to handle updating of an existing SubscriptionPackage instance.
        """
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()  # Validates the model instance before saving
        instance.save()

        return instance

class UserSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSubscription
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class UsageTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageTracking
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'
