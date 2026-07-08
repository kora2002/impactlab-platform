from django.urls import path
from . import views

urlpatterns = [
    path('bailleurs/', views.BailleurListCreateView.as_view(), name='liste_bailleurs'),
    path('bailleurs/<int:pk>/', views.BailleurDetailView.as_view(), name='detail_bailleur'),
    path('', views.FinancementListCreateView.as_view(), name='liste_financements'),
    path('<int:pk>/', views.FinancementDetailView.as_view(), name='detail_financement'),
    path('total/', views.TotalFinancementsView.as_view(), name='total_financements'),
]