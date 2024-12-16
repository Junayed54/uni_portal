import uuid
from django.db import models
from django.db.models import Sum
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import date
from invitation.models import ExamInvite
# from django.contrib.auth import get_user_model
from subscription.models import SubscriptionPackage, UserSubscription, UsageTracking
User = get_user_model()



class ExamCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    @property
    def exam_count(self):
        """Return the number of exams under this category."""
        return self.exams.count()

    class Meta:
        verbose_name_plural = "Exam Categories"
        ordering = ['name']


class Exam(models.Model):
    exam_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    total_questions = models.PositiveIntegerField()
    created_by = models.ForeignKey(User, related_name='exams_created', on_delete=models.SET_NULL, null=True, blank=True)
    total_mark = models.PositiveIntegerField()
    pass_mark = models.PositiveIntegerField()
    negative_mark = models.FloatField(null=True, blank=True, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    starting_time = models.DateTimeField(null=True, blank=True)
    last_date = models.DateField(null=True, blank=True)
    category = models.ForeignKey(ExamCategory, related_name='exams', on_delete=models.SET_NULL, null=True, blank=True)
    duration = models.DurationField(null=True, blank=True, help_text="Duration in format: HH:MM:SS (e.g., 1:30:00 for 1 hour 30 minutes)")
    is_paid = models.BooleanField(default=False, help_text="Indicates if the exam is paid.")
    
    
    def __str__(self):
        return f"{self.title} (Category: {self.category.name if self.category else 'Uncategorized'})"

    @property
    def status(self):
        """Return exam status as 'Upcoming', 'Ongoing', or 'Closed'."""
        now = timezone.now()
        if self.starting_time and self.last_date:
            end_time = self.starting_time + self.duration if self.duration else timezone.make_aware(
                timezone.datetime.combine(self.last_date, timezone.datetime.max.time()))
            if now < self.starting_time:
                return "Upcoming"
            elif self.starting_time <= now <= end_time:
                return "active"
            
        if self.last_date:
            now = now = timezone.now().date()
            if now <= self.last_date:
                return "Ongoing"
            

        return "archived"

    def calculate_pass_fail(self, correct_answers):
        """Determine if the user has passed or failed based on correct answers."""
        return correct_answers >= self.pass_mark

    def get_user_attempt_count(self, user):
        """Get the number of attempts by a specific user."""
        return ExamAttempt.objects.filter(user=user, exam=self).count()

    def can_user_access(self, user):
        """
        Determines if a user can access the exam based on its payment status, ownership, invitation, or subscription usage.
        """
        # If the exam is not paid, allow unlimited access
        if not self.is_paid:
            return True

        # Allow access if the user is the creator of the exam
        if self.created_by == user:
            return True

        # Allow access if the user has an accepted invitation
        if ExamInvite.objects.filter(exam=self, invited_user=user, is_accepted=True).exists():
            return True

        # Get the user's active subscription
        subscription = UserSubscription.objects.filter(user=user, status='active').first()
        if not subscription or not subscription.is_active():
            return False

        # Check usage tracking for the user's subscription
        usage = UsageTracking.objects.filter(user=user, package=subscription.package).first()
        if not usage:
            return False

        # Ensure the user has not exceeded their exam-taking limit
        if not usage.can_take_exam():
            return False

        # Ensure other conditions, such as exam category matching or subscription specifics, are met
        if self.category and self.category not in subscription.package.allowed_categories:
            return False

        return True


    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Exam"
        verbose_name_plural = "Exams"


class Status(models.Model):
    STATUS_CHOICES = [
        ('student', 'student'),
        ('draft', 'Draft'),
        ('submitted_to_admin', 'Submitted to Admin'),
        ('under_review', 'Under Review'),
        ('reviewed', 'Reviewed'),
        ('returned_to_creator', 'Returned to Creator'),
        ('published', 'Published'),
    ]
    
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name = 'exam')
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="user")
    # description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name = "reviewed_by")  # Admin who reviewed the exam

    def __str__(self):
        return f"{self.exam.title} - {self.status}"


    def get_exam_details(self):
        """
        This method returns a dictionary containing the exam details needed for the frontend.
        """
        return {
            'title': self.exam.title,
            # 'category': self.exam.category.name,
            'created_by': self.exam.created_by.username,  # Assuming 'created_by' is a ForeignKey to User in Exam model
            'total_questions': self.exam.total_questions,
            'total_marks': self.exam.total_mark,
            'negative_mark': self.exam.negative_mark,
            'pass_mark': self.exam.pass_mark,
            'starting_time': self.exam.starting_time,
            'duration': self.exam.duration,
            'last_date': self.exam.last_date,
            'status': self.status,
            'reviewed_by': self.reviewed_by.username if self.reviewed_by else None,
            'user': self.user.username if self.user else None,
        }

class ExamDifficulty(models.Model):
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name='difficulty')
    difficulty1_percentage = models.IntegerField(default=0)  # Difficulty 1 (0-100%)
    difficulty2_percentage = models.IntegerField(default=0)  # Difficulty 2 (0-100%)
    difficulty3_percentage = models.IntegerField(default=0)  # Difficulty 3 (0-100%)
    difficulty4_percentage = models.IntegerField(default=0)  # Difficulty 4 (0-100%)
    difficulty5_percentage = models.IntegerField(default=0)  # Difficulty 5 (0-100%)
    difficulty6_percentage = models.IntegerField(default=0)  # Difficulty 6 (0-100%)

    def clean(self):
        """
        Ensure the sum of the difficulty percentages is 100%.
        """
        total_percentage = (self.difficulty1_percentage + self.difficulty2_percentage +
                            self.difficulty3_percentage + self.difficulty4_percentage +
                            self.difficulty5_percentage + self.difficulty6_percentage)
        if total_percentage != 100:
            raise ValidationError("The total percentage of difficulty questions must equal 100.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Difficulty for {self.exam.title}"

    class Meta:
        verbose_name = 'Exam Difficulty'
        verbose_name_plural = 'Exam Difficulties'




class ExamAttempt(models.Model):
    exam = models.ForeignKey('Exam', related_name='attempts', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    answered = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False, null=True)
    total_correct_answers = models.PositiveIntegerField(default=0)
    attempt_time = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(default=0.0, null=True, blank=True)
    class Meta:
        ordering = ['-attempt_time']
        verbose_name = "Exam Attempt"
        verbose_name_plural = "Exam Attempts"

    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - {self.total_correct_answers} correct answers"

    def get_answered_questions(self):
        return self.user_answers.filter(selected_option__isnull=False)

    def get_unanswered_questions(self):
        all_questions = self.exam.questions.all()
        answered_questions_ids = self.user_answers.values_list('question', flat=True)
        return all_questions.exclude(id__in=answered_questions_ids)

    def get_wrong_answers(self):
        return self.user_answers.filter(is_correct=False)
    
    
    
    
    @property
    def score(self):
        """Calculate and return the user's score."""
        return max(self.total_correct_answers - self.wrong_answers, 0)

    @property
    def is_passed(self):
        """Check if the attempt passed based on exam pass mark."""
        return self.total_correct_answers >= self.exam.pass_mark

    @classmethod
    def total_correct_for_user_exam(cls, user, exam):
        """Get total correct answers for a user across all attempts for a specific exam."""
        return cls.objects.filter(user=user, exam=exam).aggregate(total_correct=Sum('total_correct_answers'))['total_correct'] or 0

    def save(self, *args, **kwargs):
        """Override save to auto-set `passed` based on `is_passed`."""
        self.passed = self.is_passed
        # self.score = self.score
        super().save(*args, **kwargs)
        
        Leaderboard.update_best_score(self.user, self.exam)


## Question section

class Institute(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    
class Unit(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    institute = models.ForeignKey(Institute, related_name="units", on_delete=models.CASCADE)
    def __str__(self):
        return self.name


    
        
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Question(models.Model):
    DIFFICULTY_LEVEL_CHOICES = [
        (1, 'Very Easy'),
        (2, 'Easy'),
        (3, 'Medium'),
        (4, 'Hard'),
        (5, 'Very Hard'),
        (6, 'Expert'),
    ]
    
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]
    
    exams = models.ManyToManyField('Exam', related_name='questions', blank=True)
    text = models.CharField(max_length=255, unique=True)
    marks = models.IntegerField()
    category = models.ForeignKey(Category, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL_CHOICES, default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted', null=True)
    remarks = models.TextField(blank=True, null=True)
    time_limit = models.IntegerField(help_text="Time limit for this question in seconds", default=60)
    created_by = models.ForeignKey(User, related_name="question_created_by", null=True, blank=True, on_delete=models.CASCADE)
    reviewed_by = models.ForeignKey(User, related_name="question_reviewed_by", null=True, blank=True, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    unit = models.ForeignKey(Unit, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    institute = models.ForeignKey(Institute, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateField(auto_now_add=True, null=True)
    updated_at = models.DateField(auto_now=True, null=True)

    def get_options(self):
        return self.options.all()

    def get_correct_answer(self):
        """Returns the correct answer text for the question, if available."""
        correct_option = self.options.filter(is_correct=True).first()
        return correct_option.text if correct_option else None
    
    def __str__(self):
        return self.text

    def category_name(self):
        return self.category.name
    
    
class QuestionUsage(models.Model):
    question = models.ForeignKey(Question, related_name='usages', on_delete=models.CASCADE)
    exam = models.CharField(max_length=255, help_text="Name of the external exam where the question was used")
    year = models.IntegerField(default=date.today().year)

    def __str__(self):
        return f"{self.question.text} used in {self.exam} ({self.year})"

    

class QuestionOption(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text



class UserAnswer(models.Model):
    exam_attempt = models.ForeignKey(ExamAttempt, related_name='user_answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(QuestionOption, on_delete=models.SET_NULL, null=True, blank=True)
    is_correct = models.BooleanField(default=False)

  


class Leaderboard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard', null=True)
    score = models.IntegerField(default=0)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='leaderboards')
    total_questions = models.IntegerField(default=0, null=True)
    class Meta:
        ordering = ['-score']  # Order by score descending

    def __str__(self):
        return f'{self.user} - {self.score}'

    @staticmethod
    def update_best_score(user, exam):
        # Calculate the cumulative total of correct answers across all attempts
        total_correct = ExamAttempt.objects.filter(user=user, exam=exam).aggregate(
            total_correct=Sum('total_correct_answers')
        )['total_correct'] or 0

        # Calculate total answered questions across all attempts for this user and exam
        total_answered = ExamAttempt.objects.filter(user=user, exam=exam).aggregate(
            total_answered=Sum('answered')
        )['total_answered'] or 0

        # Update the leaderboard entry with the cumulative score and total answered questions
        leaderboard_entry, created = Leaderboard.objects.get_or_create(user=user, exam=exam)
        leaderboard_entry.score = total_correct
        leaderboard_entry.total_questions = total_answered
        leaderboard_entry.save()
    
    def get_position(self):
        # Fetch all leaderboard entries for the exam ordered by score
        ordered_leaderboard = Leaderboard.objects.filter(exam=self.exam).order_by('-score')
        # Generate a list of users with their ranks
        position = 1
        for entry in ordered_leaderboard:
            if entry.user == self.user:
                return position
            position += 1
        return None
        
