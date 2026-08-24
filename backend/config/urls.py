from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),

    # Documentation API (Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API Users
    path('api/users/', include('apps.users.urls')),

    # API Programmes
    path('api/programmes/', include('apps.programmes.urls')),

    # API Bénéficiaires
    path('api/', include('apps.beneficiaires.urls')),

    # API Inscriptions
    path('api/inscriptions/', include('apps.inscriptions.urls')),

    # API Suivi
    path('api/suivi/', include('apps.suivi.urls')),

    # API Financements
    path('api/financements/', include('apps.financements.urls')),

    # API Documents
    path('api/documents/', include('apps.documents.urls')),
    

    # API Dashboard
    path('api/dashboard/', include('apps.dashboard.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)