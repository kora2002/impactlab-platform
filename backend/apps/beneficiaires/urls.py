from django.urls import path
from . import views

urlpatterns = [
    # Bénéficiaires
    path('beneficiaires/', views.BeneficiaireListCreateView.as_view(), name='liste_beneficiaires'),
    path('beneficiaires/<int:pk>/', views.BeneficiaireDetailView.as_view(), name='detail_beneficiaire'),
    path('beneficiaires/<int:pk>/historique/', views.BeneficiaireHistoriqueView.as_view(), name='historique_beneficiaire'),

    # Structures
    path('structures/', views.StructureListCreateView.as_view(), name='liste_structures'),
    path('structures/<int:pk>/', views.StructureDetailView.as_view(), name='detail_structure'),
    path('structures/<int:structure_id>/membres/', views.AjouterMembreStructureView.as_view(), name='ajouter_membre'),
]