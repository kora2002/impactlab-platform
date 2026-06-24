from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Connexion → renvoie les tokens JWT
    path('login/', views.LoginView.as_view(), name='login'),

    # Rafraîchir le token quand il expire
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Voir et modifier son profil
    path('profil/', views.ProfilView.as_view(), name='profil'),

    # Créer un utilisateur (Direction uniquement)
    path('creer/', views.CreerUtilisateurView.as_view(), name='creer_utilisateur'),

    # Lister les utilisateurs
    path('', views.ListeUtilisateursView.as_view(), name='liste_utilisateurs'),

    # Changer son mot de passe
    path('changer-mdp/', views.ChangerMotDePasseView.as_view(), name='changer_mdp'),
]