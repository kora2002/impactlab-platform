from django.urls import path
from . import views

urlpatterns = [
    path('', views.SuiviInsertionListCreateView.as_view(), name='liste_suivi'),
    path('<int:pk>/', views.SuiviInsertionDetailView.as_view(), name='detail_suivi'),
    path('parite/', views.IndicateurParite.as_view(), name='indicateur_parite'),
]