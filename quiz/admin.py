from django.contrib import admin
from .models import Exam, ExamCategory, Status, Question, QuestionUsage, QuestionOption, ExamAttempt, Leaderboard, Category, ExamDifficulty
import nested_admin



@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')



class QuestionOptionInline(nested_admin.NestedTabularInline):
    model = QuestionOption
    extra = 4  # Number of extra forms to display in the admin

class QuestionInline(nested_admin.NestedTabularInline):
    model = Question
    extra = 0  # Number of extra forms to display in the admin
    inlines = [QuestionOptionInline]
    
    
@admin.register(QuestionUsage)
class QuestionUsageAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'exam', 'year')
    list_filter = ('exam', 'year')
    search_fields = ('question__text', 'exam')

    def question_text(self, obj):
        return obj.question.text
    question_text.short_description = 'Question Text'
    
class QuestionInline(admin.TabularInline):
    model = Exam.questions.through  # Assuming a Many-to-Many relationship
    extra = 0  # No extra empty fields 

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'total_questions', 'status', 'created_by', 'created_at', 'starting_time', 'last_date')
    list_filter = ('category',)  # Filters by category and status
    search_fields = ('title', 'category__name', 'created_by__username')  # Enables search by title, category name, and creator's username
    readonly_fields = ('status', 'created_at', 'updated_at')  # Makes non-editable fields read-only
    ordering = ('-created_at',)


    inlines = [QuestionInline]
    def status(self, obj):
        """Display current status of the exam."""
        return obj.status  # Uses the `status` property from the model
    status.short_description = "Exam Status"




@admin.register(ExamCategory)
class ExamCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'exam_count')  # Display the name and count of exams in each category
    search_fields = ('name',)  # Allows search by category name
    ordering = ('name',)  # Orders categories alphabetically
    readonly_fields = ('exam_count',)  # Makes exam_count a read-only field in admin

    def exam_count(self, obj):
        """Display number of exams in each category."""
        return obj.exam_count  # Uses the `exam_count` property from the model
    exam_count.short_description = "Number of Exams"             

class StatusAdmin(admin.ModelAdmin):
    list_display = ('id', 'exam', 'status', 'reviewed_by')  # Display important fields
    list_filter = ('status', 'reviewed_by')  # Add filters for status and reviewer
    search_fields = ('exam__title',)  # Enable search on exam title and description
    autocomplete_fields = ['reviewed_by']  # Allows selecting from a long list of users easily
    readonly_fields = ['exam']  # Make exam field read-only
    list_select_related = ('exam', 'reviewed_by')  # Optimizes queries by selecting related objects

    def get_queryset(self, request):
        """Optimize queries by selecting related exam and reviewer"""
        queryset = super().get_queryset(request)
        return queryset.select_related('exam', 'reviewed_by')

admin.site.register(Status, StatusAdmin)      
                
@admin.register(ExamDifficulty)
class ExamDifficultyAdmin(admin.ModelAdmin):
    list_display = ('exam', 'difficulty1_percentage', 'difficulty2_percentage', 'difficulty3_percentage', 'difficulty4_percentage', 'difficulty5_percentage', 'difficulty6_percentage')
    search_fields = ('exam__title',)


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'remarks', 'category', 'difficulty_level', 'marks', 'status', 'created_by', 'reviewed_by', 'created_at', 'updated_at')
    list_filter = ('difficulty_level', 'status', 'category')
    search_fields = ('text', 'remarks')
    # ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    # list_editable = ('status', 'marks', 'difficulty_level')
    
    # To display related options in the question admin interface
    def get_options(self, obj):
        return ", ".join([str(option) for option in obj.get_options()])
    
    get_options.short_description = 'Options'

# Register the admin class
admin.site.register(Question, QuestionAdmin)



@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('text', 'question__text')

@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'exam', 'total_correct_answers', 'wrong_answers', 'answered', 'passed', 'attempt_time', 'score')
    list_filter = ('passed', 'exam')
    search_fields = ('user__username', 'exam__title')
    readonly_fields = ('score', 'attempt_time')
    ordering = ('-attempt_time',)

    def score(self, obj):
        return obj.score  # Uses the `score` property to display the calculated score
    score.short_description = 'Score'

@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'exam')
    search_fields = ('user__username', 'exam__title')
    list_filter = ('exam', 'score')


