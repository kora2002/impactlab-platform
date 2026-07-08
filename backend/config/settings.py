from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

# ==========================================================
# Chargement des variables d'environnement
# ==========================================================
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================================
# Sécurité
# ==========================================================
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]

# ==========================================================
# Applications
# ==========================================================
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Applications tierces
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "drf_spectacular",

    # Applications du projet
    "apps.users",
    "apps.programmes",
    "apps.beneficiaires",
    "apps.inscriptions",
    "apps.suivi",
    "apps.financements",
    "apps.documents",
    "apps.dashboard",   # Supprimer si l'application n'existe pas
]

# ==========================================================
# Middleware
# ==========================================================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ==========================================================
# URLs
# ==========================================================
ROOT_URLCONF = "config.urls"

# ==========================================================
# Templates
# ==========================================================
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

WSGI_APPLICATION = "config.wsgi.application"

# ==========================================================
# Base de données PostgreSQL
# ==========================================================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DATABASE_NAME"),
        "USER": os.getenv("DATABASE_USER"),
        "PASSWORD": os.getenv("DATABASE_PASSWORD"),
        "HOST": os.getenv("DATABASE_HOST"),
        "PORT": os.getenv("DATABASE_PORT"),
    }
}

# ==========================================================
# Modèle utilisateur personnalisé
# ==========================================================
AUTH_USER_MODEL = "users.Utilisateur"

# ==========================================================
# Validation des mots de passe
# ==========================================================
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

# ==========================================================
# Internationalisation
# ==========================================================
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Abidjan"

USE_I18N = True
USE_TZ = True

# ==========================================================
# Fichiers statiques et médias
# ==========================================================
STATIC_URL = "static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ==========================================================
# Django REST Framework
# ==========================================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# ==========================================================
# JWT
# ==========================================================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "ALGORITHM": "HS256",
}

# ==========================================================
# CORS
# ==========================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# ==========================================================
# Swagger
# ==========================================================
SPECTACULAR_SETTINGS = {
    "TITLE": "Impact'Lab GDC API",
    "DESCRIPTION": "API de gestion des bénéficiaires et du suivi-évaluation des programmes.",
    "VERSION": "1.0.0",
}