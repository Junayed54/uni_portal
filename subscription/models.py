from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import date

User = get_user_model()

# Subscription Package Model

class SubscriptionPackage(models.Model):
    PACKAGE_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium')
    ]
    
    name = models.CharField(max_length=200, choices=PACKAGE_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_in_days = models.IntegerField(default=30)
    max_exams = models.IntegerField(default=5)
    max_attampts = models.IntegerField(default=5)
    
    very_easy_percentage = models.CharField(max_length=10)
    easy_percentage = models.CharField(max_length=10)
    medium_percentage = models.CharField(max_length=10)
    hard_percentage = models.CharField(max_length=10)
    very_hard_percentage = models.CharField(max_length=10)
    expert_percentage = models.CharField(max_length=10)

    def validate_percentage_range(self, percentage_range):
        try:
            start, end = map(int, percentage_range.split('-'))
            if not (0 <= start <= 100 and 0 <= end <= 100 and start <= end):
                raise ValidationError(f"Invalid range: {percentage_range}.")
        except ValueError:
            raise ValidationError(f"Invalid format for percentage range: {percentage_range}. Must be in 'start-end' format.")

    def clean(self):
        self.validate_percentage_range(self.very_easy_percentage)
        self.validate_percentage_range(self.easy_percentage)
        self.validate_percentage_range(self.medium_percentage)
        self.validate_percentage_range(self.hard_percentage)
        self.validate_percentage_range(self.very_hard_percentage)
        self.validate_percentage_range(self.expert_percentage)

    def __str__(self):
        return f"{self.get_name_display()} Package - ${self.price}"


# User Subscription Model
class UserSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('expired', 'Expired'), ('cancelled', 'Cancelled')], default='active')
    auto_renew = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Subscription to {self.package.name}"

    def is_active(self):
        """Check if the subscription is active and not expired."""
        today = date.today()
        return self.status == 'active' and self.start_date <= today <= self.end_date


# Payment Model
class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='completed')

    def __str__(self):
        return f"Payment of ${self.amount} by {self.user.username} for {self.package.name}"

# Usage Tracking Model

class UsageTracking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True, related_name='usage_tracking')
    total_exams_taken = models.IntegerField(default=0)
    total_attempts_taken = models.IntegerField(default=0)
    
    # New field to track specific exams and attempts
    exam_attempts = models.JSONField(null=True, blank=True)  # Stores data like {"exam_id_1": attempts, "exam_id_2": attempts}

    def can_take_exam(self, exam_id):
        """
        Returns True if the user can still take the specified exam.
        """
        return self.total_exams_taken < self.package.max_exams and self.exam_attempts.get(str(exam_id), {}).get("attempts", 0) < self.package.max_attampts

    def can_attempt_exam(self, exam_id):
        """
        Returns True if the user can still attempt the specified exam.
        """
        # Fetch the maximum allowed attempts for the package
        max_attempts = self.package.max_attampts  # Assume this is a field in SubscriptionPackage
        
        # Fetch the current attempts for the specific exam from exam_attempts
        current_attempts = self.exam_attempts.get(str(exam_id), {}).get("attempts", 0)
        
        # Compare current attempts with the maximum allowed attempts
        return current_attempts < max_attempts

    def increment_exam(self, exam_id):
        """
        Increments the exam attempt count for the given exam.
        If it's a new exam attempt, it initializes it.
        """
        exam_id_str = str(exam_id)
        
        # Check if the exam ID is already in the exam_attempts dictionary
        if exam_id_str not in self.exam_attempts:
            # If it's a new exam, initialize it with attempts = 0
            self.exam_attempts[exam_id_str] = {"attempts": 0}
            self.total_exams_taken += 1
        
        # Increment the attempts for this exam
        self.exam_attempts[exam_id_str]["attempts"] += 1
        
        # Increment the total attempts taken
        # self.total_attempts_taken += 1
        
        # Save the updated usage tracking object
        self.save()


    def __str__(self):
        return f"{self.user.username}'s Usage for {self.package}"
    
    
    def increment_attempt(self, exam_id):
        """
        Increment the number of attempts taken by the user for a particular exam.
        """
        if self.can_attempt_exam(exam_id):
            self.exam_attempts[str(exam_id)] = self.exam_attempts.get(str(exam_id), 0) + 1
            self.total_attempts_taken += 1
            self.save()
        else:
            raise ValueError("User has reached the maximum number of attempts for this exam.")

    def __str__(self):
        return f"{self.user.username}'s Usage for {self.package}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        
# Subscription History Model
class SubscriptionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.user.username}'s Subscription History for {self.package.name}"

# Coupon Model
class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    valid_from = models.DateField()
    valid_until = models.DateField()
    usage_limit = models.IntegerField(default=None, null=True)
    used_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Coupon: {self.code} - {self.discount_percentage}% off"

# Payment Plan Model
class PaymentPlan(models.Model):
    name = models.CharField(max_length=50)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    num_installments = models.IntegerField()
    installment_amount = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return self.name

# Notification Model
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"

# Refund Model
class Refund(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True)
    refund_amount = models.DecimalField(max_digits=8, decimal_places=2)
    refund_reason = models.TextField()
    refund_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')

    def __str__(self):
        return f"Refund of ${self.refund_amount} for {self.user.username}"

# Subscription Analytics Model
class SubscriptionAnalytics(models.Model):
    package = models.ForeignKey(SubscriptionPackage, on_delete=models.CASCADE)
    total_users = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    subscription_start_date = models.DateField()
    subscription_end_date = models.DateField()
    churn_rate = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Analytics for {self.package.name}"



