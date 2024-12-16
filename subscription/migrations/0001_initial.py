# Generated by Django 5.1.1 on 2024-12-15 15:51

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Coupon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50, unique=True)),
                ('discount_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('valid_from', models.DateField()),
                ('valid_until', models.DateField()),
                ('usage_limit', models.IntegerField(default=None, null=True)),
                ('used_count', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('payment_date', models.DateTimeField(auto_now_add=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=8)),
                ('payment_method', models.CharField(max_length=50)),
                ('transaction_id', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='completed', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='PaymentPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=8)),
                ('num_installments', models.IntegerField()),
                ('installment_amount', models.DecimalField(decimal_places=2, max_digits=8)),
            ],
        ),
        migrations.CreateModel(
            name='Refund',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('refund_amount', models.DecimalField(decimal_places=2, max_digits=8)),
                ('refund_reason', models.TextField()),
                ('refund_date', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='SubscriptionAnalytics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_users', models.IntegerField(default=0)),
                ('total_revenue', models.DecimalField(decimal_places=2, max_digits=10)),
                ('subscription_start_date', models.DateField()),
                ('subscription_end_date', models.DateField()),
                ('churn_rate', models.DecimalField(decimal_places=2, max_digits=5)),
            ],
        ),
        migrations.CreateModel(
            name='SubscriptionHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='SubscriptionPackage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('free', 'Free'), ('basic', 'Basic'), ('standard', 'Standard'), ('premium', 'Premium')], max_length=200)),
                ('price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('duration_in_days', models.IntegerField(default=30)),
                ('max_exams', models.IntegerField(default=5)),
                ('max_attampts', models.IntegerField(default=5)),
                ('very_easy_percentage', models.CharField(max_length=10)),
                ('easy_percentage', models.CharField(max_length=10)),
                ('medium_percentage', models.CharField(max_length=10)),
                ('hard_percentage', models.CharField(max_length=10)),
                ('very_hard_percentage', models.CharField(max_length=10)),
                ('expert_percentage', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='UsageTracking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_exams_taken', models.IntegerField(default=0)),
                ('total_attempts_taken', models.IntegerField(default=0)),
                ('exam_attempts', models.JSONField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField(auto_now_add=True)),
                ('end_date', models.DateField()),
                ('status', models.CharField(choices=[('active', 'Active'), ('expired', 'Expired'), ('cancelled', 'Cancelled')], default='active', max_length=20)),
                ('auto_renew', models.BooleanField(default=True)),
            ],
        ),
    ]
