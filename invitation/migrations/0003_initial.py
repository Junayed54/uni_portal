# Generated by Django 5.1.1 on 2024-12-15 15:51

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('invitation', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='examinvite',
            name='invited_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_invites', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='examinvite',
            name='invited_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='received_invites', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='examinvite',
            unique_together={('exam', 'invited_user')},
        ),
    ]
