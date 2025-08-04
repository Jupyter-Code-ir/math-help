# ----------------------------------------------------------------------------------+
#                                                                                   |
#                                      IMPORTS                                      |
#                                                                                   |
# ----------------------------------------------------------------------------------+

from datetime import timedelta
from pathlib import Path
import os


# ----------------------------------------------------------------------------------+
#                                                                                   |
#                                      SECURITY                                     |
#                                                                                   |
# ----------------------------------------------------------------------------------+


BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "kv#%i&btm=q$j8v%w4t-^e+!3d=x+ny+)06$2_44s#p7qp=5sd"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=300),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,  
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}
AUTH_USER_MODEL = 'persons.CustomUser'
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}


# ----------------------------------------------------------------------------------+
#                                                                                   |
#                                        CORS                                       |
#                                                                                   |
# ----------------------------------------------------------------------------------+
ALLOWED_HOSTS = ["*"]

CORS_ALLOWED_ORIGINS = [
    "http://*",
    "https://*",
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True


# ----------------------------------------------------------------------------------+
#                                                                                   |
#                                   INSTALLED APPS                                  |
#                                                                                   |
# ----------------------------------------------------------------------------------+


DEPENDENCIES = [
    "rest_framework",
    "corsheaders",
    "import_export",
]

MAIN_APPS = [
    "persons",
    "history",
    "core",
]


INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    *DEPENDENCIES,
    *MAIN_APPS,
    'django_apscheduler',
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ----------------------------------------------------------------------------------+
#                                                                                   |
#                                     DEFINITION                                    |
#                                                                                   |
# ----------------------------------------------------------------------------------+


ROOT_URLCONF = "server.urls"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "server.wsgi.application"


# ----------------------------------------------------------------------------------+
#                                                                                   |
#                                  DATABASE & FILES                                 |
#                                                                                   |
# ----------------------------------------------------------------------------------+


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "data/db.sqlite3",
    }
}


STATIC_ROOT = STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]



# ----------------------------------------------------------------------------------+
#                                                                                   |
#                               INTERNATIONALIZATION                                |
#                                                                                   |
# ----------------------------------------------------------------------------------+


# LANGUAGE_CODE = "fa-ir"
LANGUAGE_CODE = "en"

TIME_ZONE = "Asia/Tehran"

USE_I18N = True

USE_TZ = True

# Jalali Date Settings
JALALI_DATE_DEFAULTS = {
    "Strftime": {
        "date": "%y/%m/%d",
        "datetime": "%H:%M:%S _ %y/%m/%d",
    },
    "Static": {
        "js": [
            "admin/js/django_jalali.min.js",
        ],
        "css": {
            "all": [
                "admin/css/jquery.ui.datepicker.jalali.css",
            ]
        },
    },
}
