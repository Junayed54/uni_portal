from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from .views import ExamCreateView, ExamViewSet, CategoryListView, CreateCategoryView, ExamDetailView, ExamAttemptViewSet, user_attempts_by_month, user_exam_attempts_by_month, LeaderboardListView, QuestionViewSet, QuestionOptionViewSet, UserCreatedExamsView, ExamUploadView, CategoryViewSet, ExamDifficultyView, QuestionHistoryByMonthView, QuestionHistoryByTeacherMonthYearView, TeacherListView, StudentListView, UserQuestionSummaryView, ExamSubjectsQuestionCountView, exam_leaderboard_view, UserExamSummaryAPIView, UserAnswerViewSet
# from .status import SubmitExamToAdminView, SendExamForReviewView, ReviewExamView, ReturnExamToCreatorView, PublishExamView
from .status import StatusViewSet
# from .question_status import QuestionStatusViewSet, AssignedQuestionsSummaryAPIView, QuestionsByUserForReviewerView
from .attampts import BestAttemptsView, UserAttemptsView

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'attempts', ExamAttemptViewSet, basename='attempts')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'question-options', QuestionOptionViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'status', StatusViewSet, basename='status')
router.register(r'user-answers', UserAnswerViewSet, basename='user-answer')
# router.register(r'question-status', QuestionStatusViewSet)
# router.register(r'question_upload', QuestionUplaodViewset)

urlpatterns = [
    path('', include(router.urls)),
    path('exams/exam_detail/<uuid:exam_id>/', ExamDetailView.as_view(), name='exam-detail' ),   
    path('exams/<uuid:exam_id>/start/', ExamViewSet.as_view({'get': 'start_exam'}), name='start-exam'),
    path('exams/<uuid:exam_id>/questions/', ExamViewSet.as_view({'get': 'get_questions'}), name='exam-questions'),
    path('leaderboard/<uuid:exam_id>/', LeaderboardListView.as_view(), name='leaderboard'),
    path('upload-excel/', ExamUploadView.as_view(), name='upload_excel'),
    path('user_exams_list/', UserCreatedExamsView.as_view(), name='user-created-exams'),
    path('add-exam-difficulty/', ExamDifficultyView.as_view(), name='add_exam_difficulty'),
    path('teachers/', TeacherListView.as_view(), name='teacher'),
    path('students/', StudentListView.as_view(), name='student'),
    path('question-history/', QuestionHistoryByMonthView.as_view(), name='question-history'),
    path('teacher-history/', QuestionHistoryByTeacherMonthYearView.as_view(), name='teacher-history'),
    path('teacher-summary/', UserQuestionSummaryView.as_view(), name='teacher-question-summary'),
    
    
    path('create-exam/', ExamCreateView.as_view(), name='create_exam'),
    path('2create_exam/', TemplateView.as_view(template_name="Html/custom/2create_exam.html"), name='2create_exam'),
    
    path("exam_categories/", CategoryListView.as_view(), name="category_list"),
    path("exam_categories/create/", CreateCategoryView.as_view(), name="create_category"),
    path('exams/<uuid:exam_id>/subjects/', ExamSubjectsQuestionCountView.as_view(), name='exam_subjects_question_count'),
    path('exams/<int:exam_id>/result/', exam_leaderboard_view, name='exam_leaderboard'),
    
    
    
    #attempts
    # path('user/user_attempts/', UserExamAttemptsAPIView.as_view(), name='user_exam_attempts'), 
    path('user_attempts_query/', user_attempts_by_month, name='user_attempts_query'),
    path('admin_user_attempts/', user_exam_attempts_by_month, name='admin_user_attempts_by_month'),
    path('user-exam-summary/<int:id>/', UserExamSummaryAPIView.as_view(), name='user_summary'),
    # templates urls
    path('student_exams/', TemplateView.as_view(template_name='Html/custom/student_exams.html'), name = 'student_exams'),
    path('exam_list/', TemplateView.as_view(template_name='Html/custom/exam_list.html'), name='exam-list'),
    path('exam_detail/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/exam_detail.html'), name='exam_detail'),
    path('teacher_exam_details/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/teacher_exam_details.html'), name='exam_detail'),

    path('start_exam/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/start_exam.html'), name='start-exam'),
    
    path('leader_board/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/leaderboard.html'), name='leader_board'),
    path('result/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/result.html'), name='result'),
    path('create_exam/', TemplateView.as_view(template_name='Html/custom/create_exam.html'), name='create_exam'),
    path('user_exams/', TemplateView.as_view(template_name='Html/custom/user_exams.html'), name='user_exams'),
    path('questions_history/', TemplateView.as_view(template_name='Html/custom/questions_history.html'), name='questions_history'),
    path('question_query/', TemplateView.as_view(template_name='Html/custom/question_query.html'), name='question_query'),
    path('teacher_summury/', TemplateView.as_view(template_name='Html/custom/teacher_summury.html'), name='teacher_summary'),
    # Template status urls
    # path('draft_exams/', TemplateView.as_view(template_name='Html/custom/draft_exams.html'), name='draft_exams'),
    path('admin_checker/', TemplateView.as_view(template_name='Html/custom/admin_checker.html'), name='admin_checker'),
    path('exam_check/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/exam_check.html'), name='exam_check'),
    path('reviewer_exams/', TemplateView.as_view(template_name='Html/custom/reviewer_exams.html'), name='reviewer_exams'),
    path('admin_reviewer/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/admin_review.html'), name='admin_review'),
    path('draft_exams/', TemplateView.as_view(template_name='Html/custom/draft_exams.html'), name='draft_exams'),
    
    
    
    # Questions section
    path('upload-questions/', TemplateView.as_view(template_name='Html/custom/question/question_upload.html'), name='question_upload'),
    path('user_questions/', TemplateView.as_view(template_name='Html/custom/question/user_questions.html'), name='user_questions'),
    path('admin_qu_review/', TemplateView.as_view(template_name='Html/custom/question/admin_qu_review.html'), name='admin_qu_review'),
    path('admin_qu_view/<int:user_id>/', TemplateView.as_view(template_name='Html/custom/question/admin_qu_view.html'), name='admin_qu_view'),
    path('reviewer_list/', TemplateView.as_view(template_name='Html/custom/question/reviewer_qu_list.html'), name='admin_qu_view.html'),
    path('reviewer_questions/<int:user_id>/', TemplateView.as_view(template_name='Html/custom/question/reviewer_questions.html'), name='admin_questions'),
    path('approved_questions/<int:user_id>/', TemplateView.as_view(template_name='Html/custom/question/approved_questions.html'), name='admin_questions'),
    path('question_bank/', TemplateView.as_view(template_name='Html/custom/question/question_bank.html'), name='question_bank'),
    
    
    
    path('remarks/', TemplateView.as_view(template_name='Html/custom/remark_attampts/remarks.html'), name='remarks'),
    path('all_attempts/', TemplateView.as_view(template_name='Html/custom/remark_attampts/all_attempts.html'), name='all_attempts'),
    path('user_attempts/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/remark_attampts/user_attempts.html'), name='user_attempts'),
    path('admin_attempts_check/', TemplateView.as_view(template_name='Html/custom/remark_attampts/admin_attempts_check.html'), name='admin_attempts_check'),
    path('exam_attempts/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/remark_attampts/exam_attempts.html'), name='exam_attempts'),
    path('users_attempts_query/', TemplateView.as_view(template_name='Html/custom/remark_attampts/user_attempts_query.html'), name='user_attempt_query'),
    path('admin_users_attempts_query/', TemplateView.as_view(template_name='Html/custom/remark_attampts/admin_user_attempts_query.html'), name='admin_user_attempts_query'),
    path('user_summary/<int:id>/', TemplateView.as_view(template_name='Html/custom/user/user_summary.html'), name='user_summary'),
    
    
    path('exam_room/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/invitation/exam_room.html'), name='exam_room'),
    
    

    
    
] + [
    path('attempts/user_best_attempts/', BestAttemptsView.as_view(), name='user_best_attempts'),
    path('attempts/user_attempts/', UserAttemptsView.as_view(), name='user_attempts'),
]


from .views import SubjectListView, UnitListView, InstituteListView

urlpatterns += [
    path('subjects/', SubjectListView.as_view(), name='get_subjects'),
    path('units/', UnitListView.as_view(), name='get_units'),
    path('institutes/', InstituteListView.as_view(), name='get_institutes'),
]


