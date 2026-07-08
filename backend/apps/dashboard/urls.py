from django.urls import path
from . import views

urlpatterns = [
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('programme/<int:programme_id>/', views.DashboardProgrammeView.as_view(), name='dashboard_programme'),
]