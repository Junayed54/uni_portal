from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings

# Set default Django settings for Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_portal.settings')

app = Celery('quiz_portal')

# Configure Celery to use Django's settings file
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscover tasks in your Django apps
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
