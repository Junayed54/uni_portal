from django.contrib import admin
from .models import (
    SubscriptionPackage,
    UserSubscription,
    Payment,
    UsageTracking,
    SubscriptionHistory,
    Coupon,
    PaymentPlan,
    Notification,
    Refund,
    SubscriptionAnalytics
)

@admin.register(SubscriptionPackage)
class SubscriptionPackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'duration_in_days', 'max_exams')
    list_filter = ('name', 'price')
    search_fields = ('name',)

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'start_date', 'end_date', 'status', 'auto_renew')
    list_filter = ('status', 'auto_renew')
    search_fields = ('user__username', 'package__name')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'payment_date', 'amount', 'payment_method', 'status')
    list_filter = ('status', 'payment_method')
    search_fields = ('user__username', 'package__name', 'transaction_id')

@admin.register(UsageTracking)
class UsageTrackingAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'total_exams_taken', 'total_attempts_taken')
    search_fields = ('user__username', 'package__name')

@admin.register(SubscriptionHistory)
class SubscriptionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'start_date', 'end_date')
    search_fields = ('user__username', 'package__name')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'valid_from', 'valid_until', 'usage_limit', 'used_count', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('code',)

@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_amount', 'num_installments', 'installment_amount')
    search_fields = ('name',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'message')

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('user', 'payment', 'refund_amount', 'refund_reason', 'refund_date', 'status')
    list_filter = ('status', 'refund_date')
    search_fields = ('user__username', 'payment__transaction_id')

@admin.register(SubscriptionAnalytics)
class SubscriptionAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('package', 'total_users', 'total_revenue', 'subscription_start_date', 'subscription_end_date', 'churn_rate')
    search_fields = ('package__name',)
