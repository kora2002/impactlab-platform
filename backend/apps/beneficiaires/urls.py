from django.urls import path
from . import views

urlpatterns = [
    # ── Routes spéciales AVANT les routes avec <pk> ──
    path('beneficiaires/import-excel/',   views.ImportExcelBeneficiairesView.as_view(), name='import_excel'),
    path('beneficiaires/modele-excel/',   views.TelechargerModeleExcelView.as_view(),   name='modele_excel'),
    path('beneficiaires/import-asso-pro/', views.ImportAssoproView.as_view(),            name='import_asso_pro'),

    # ── Bénéficiaires ──
    path('beneficiaires/',                views.BeneficiaireListCreateView.as_view(),   name='liste_beneficiaires'),
    path('beneficiaires/<int:pk>/',       views.BeneficiaireDetailView.as_view(),       name='detail_beneficiaire'),
    path('beneficiaires/<int:pk>/historique/', views.BeneficiaireHistoriqueView.as_view(), name='historique_beneficiaire'),

    # ── Structures ──
    path('structures/',                   views.StructureListCreateView.as_view(),      name='liste_structures'),
    path('structures/<int:pk>/',          views.StructureDetailView.as_view(),          name='detail_structure'),
    path('structures/<int:structure_id>/membres/', views.AjouterMembreStructureView.as_view(), name='ajouter_membre'),

    path('beneficiaires/import-sageo/', views.ImportSageoView.as_view(), name='import_sageo'),
    path('beneficiaires/import-igbs/',  views.ImportIGBSView.as_view(),  name='import_igbs'),
    path('beneficiaires/cours-academy/', views.CoursAcademyView.as_view(), name='cours_academy'),

    path('connecteurs/tester/',   views.ConnecteurTesterView.as_view(),   name='connecteur_tester'),
    path('connecteurs/importer/', views.ConnecteurImporterView.as_view(), name='connecteur_importer'),

    path('sageo/cohortes/',  views.SageoCohorteView.as_view(),  name='sageo_cohortes'),
   path('sageo/reporting/', views.SageoReportingView.as_view(), name='sageo_reporting'),


]