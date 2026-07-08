from django.urls import path
from . import views

urlpatterns = [
    # Programmes
    path('', views.ProgrammeListCreateView.as_view(), name='liste_programmes'),
    path('<int:pk>/', views.ProgrammeDetailView.as_view(), name='detail_programme'),

    # Étapes d'un programme
    path('<int:programme_id>/etapes/', views.EtapeListCreateView.as_view(), name='etapes_programme'),

    # Cohortes d'un programme
    path('<int:programme_id>/cohortes/', views.CohorteListCreateView.as_view(), name='cohortes_programme'),
]