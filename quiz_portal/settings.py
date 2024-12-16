# Django settings for quiz_portal project.
# import django
# django.setup()
# Import necessary modules

from pathlib import Path
from datetime import timedelta
import dj_database_url
from decouple import config
from django.core.management.utils import get_random_secret_key
import os
from decouple import config
import django.core.management.commands.runserver as runserver
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


runserver.Command.default_port = config('WebServer_Port', default = "8001")
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'wkf6c#&j%k%-jae(!p_*dq&9x*j_cvsa_l4ump#5f-^p1b(-8b'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
# FRONTEND_URL = 'http://localhost:8000'

# ALLOWED_HOSTS = []
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://217.76.63.211:8001",
]



# Custom user model
AUTH_USER_MODEL = 'users.CustomUser'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'jonaetshanto8@gmail.com'
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')

ALLOWED_HOSTS = ['127.0.0.1','localhost', '217.76.63.211']

# Application definition
INSTALLED_APPS = [
    # Django apps
    'daphne',
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'nested_admin',
    'django.contrib.sites',  # Add this for Django Allauth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    # Your apps
    'users',
    
    'quiz',
    'frontend',
    'invitation',
    'subscription',
    # 'university',
    
    
]


AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',  # Default
    'allauth.account.auth_backends.AuthenticationBackend',  # Allauth backend
)




# Middleware settings
MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    
]

# Root URL configuration
ROOT_URLCONF = 'quiz_portal.urls'

# Django REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    
}

# Template settings
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, "frontend", "templates"),
            os.path.join(BASE_DIR, "invitation", "templates") 
            ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.request',
            ],
        },
    },
]




# Now you can access the values from the .env file
GOOGLE_OAUTH_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID')
GOOGLE_OAUTH_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET')

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': GOOGLE_OAUTH_CLIENT_ID,
            'secret': GOOGLE_OAUTH_CLIENT_ID,
          
        },
        'SCOPE': ['profile','email',],
         'AUTH_PARAMS': {'access_type': 'online'},
        'METHOD': 'oauth2',
        'VERIFIED_EMAIL': True,
    },
   
}

SITE_ID = 1

SOCIALACCOUNT_LOGIN_ON_GET = True

LOGIN_REDIRECT_URL = 'success'
SOCIALACCOUNT_AUTO_SIGNUP = True
ACCOUNT_LOGOUT_REDIRECT_URL = "/login/"

# WSGI application
# WSGI_APPLICATION = 'quiz_portal.wsgi.application'
#ASGI application
ASGI_APPLICATION = 'quiz_portal.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}
# CORS_ALLOW_HEADERS = [
#     'authorization',
#     'content-type',
#     'x-requested-with',
# ]
# Database configuration (SQLite for simplicity)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'uni_portal',  # Your database name
        'USER': 'root',     # The new user you just created
        'PASSWORD': 'Bridgers@123',  # The password for the new user
        'HOST': 'localhost',
        'PORT': '3306',  # Default MySQL port
    }
}




# DATABASE_URL = 'postgresql://postgres:WOCPsPKPuyQZVEyjVagJxLLidyAWeGWt@junction.proxy.rlwy.net:44188/railway'

# DATABASES = {
#     'default': dj_database_url.config(
#         default=config('DATABASE_URL', default=DATABASE_URL)
#     )
# }


# Password validation
AUTH_PASSWORD_VALIDATORS = []

# Internationalization settings
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)

import os

# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles_build')
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'staticfiles'),
    BASE_DIR / 'frontend' / 'static',
]
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"
# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Allauth settings
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'phone_number'
ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_UNIQUE_EMAIL = True

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'phone_number',  # Adjust based on your custom user model
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# Social account providers


# DEFAULT_FROM_EMAIL = 'your-email@example.com'


# Celery settings
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'



