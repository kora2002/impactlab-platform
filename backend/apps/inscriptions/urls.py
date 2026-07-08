from django.urls import path
from . import views

urlpatterns = [
    path('', views.InscriptionListCreateView.as_view(), name='liste_inscriptions'),
    path('<int:pk>/', views.InscriptionDetailView.as_view(), name='detail_inscription'),
    path('<int:pk>/valider/', views.ValiderInscriptionView.as_view(), name='valider_inscription'),
    path('<int:pk>/avancer/', views.AvancerEtapeView.as_view(), name='avancer_etape'),
    path('<int:pk>/abandonner/', views.AbandonnerView.as_view(), name='abandonner'),
]