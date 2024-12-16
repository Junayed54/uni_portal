from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Max
from .models import ExamAttempt
from .serializers import ExamAttemptSerializer
class BestAttemptsView(APIView):
    def get(self, request, *args, **kwargs):
        exam_id = request.GET.get('exam_id')
        if not exam_id:
            return Response({'error': 'Exam ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        best_attempts_data = (
            ExamAttempt.objects.filter(exam_id=exam_id)
            .values('user_id', 'user__username')
            .annotate(
                max_score=Max('total_correct_answers'),
                best_attempt_id=Max('id')
            )
            .order_by('-max_score')
        )

        # Fetch full details of the best attempts
        best_attempt_ids = [attempt['best_attempt_id'] for attempt in best_attempts_data]
        best_attempts = ExamAttempt.objects.filter(id__in=best_attempt_ids).select_related('user', 'exam')

        # Serialize the data
        serializer = ExamAttemptSerializer(best_attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserAttemptsView(APIView):
    def get(self, request, *args, **kwargs):
        exam_id = request.GET.get('exam_id')
        user_id = request.GET.get('user_id')

        if not exam_id or not user_id:
            return Response(
                {'error': 'Exam ID and User ID are required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        attempts = ExamAttempt.objects.filter(exam_id=exam_id, user_id=user_id).order_by('-attempt_time')
        attempt_data = attempts.values(
            'id',
            'attempt_time',
            'total_questions',
            'answered',
            'total_correct_answers',
            'wrong_answers',
            'pass_mark'
        )

        return Response(list(attempt_data), status=status.HTTP_200_OK)


