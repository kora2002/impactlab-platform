from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Utilisateur
from .serializers import (
    UtilisateurSerializer,
    CreerUtilisateurSerializer,
    ChangerMotDePasseSerializer
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Personnalise le token JWT pour inclure les infos
    de l'utilisateur directement dans la réponse de login
    """
    def validate(self, attrs):
        # Récupère les tokens (access + refresh)
        data = super().validate(attrs)

        # Ajoute les infos de l'utilisateur dans la réponse
        data['utilisateur'] = {
            'id'        : self.user.id,
            'username'  : self.user.username,
            'email'     : self.user.email,
            'nom'       : self.user.get_full_name(),
            'role'      : self.user.role,
            'telephone' : self.user.telephone,
        }
        return data


class LoginView(TokenObtainPairView):
    """
    Vue de connexion
    POST /api/users/login/
    Corps : { "username": "admin", "password": "Admin2026!" }
    Réponse : { "access": "...", "refresh": "...", "utilisateur": {...} }
    """
    serializer_class = CustomTokenObtainPairSerializer


class ProfilView(APIView):
    """
    Vue pour voir et modifier son propre profil
    GET  /api/users/profil/  → voir son profil
    PUT  /api/users/profil/  → modifier son profil
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # request.user = l'utilisateur connecté (identifié via le token JWT)
        serializer = UtilisateurSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UtilisateurSerializer(
            request.user,
            data=request.data,
            partial=True  # permet de modifier seulement certains champs
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreerUtilisateurView(generics.CreateAPIView):
    """
    Créer un nouvel utilisateur (Direction uniquement)
    POST /api/users/creer/
    """
    serializer_class   = CreerUtilisateurSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Seule la Direction peut créer des comptes
        if not self.request.user.is_direction:
            return Response(
                {"detail": "Permission refusée."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()


class ListeUtilisateursView(generics.ListAPIView):
    """
    Lister tous les utilisateurs (Direction uniquement)
    GET /api/users/
    """
    serializer_class   = UtilisateurSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Seule la Direction voit tous les utilisateurs
        if self.request.user.is_direction:
            return Utilisateur.objects.all().order_by('last_name')
        # Les autres ne voient que leur propre compte
        return Utilisateur.objects.filter(id=self.request.user.id)


class ChangerMotDePasseView(APIView):
    """
    Changer son mot de passe
    POST /api/users/changer-mdp/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangerMotDePasseSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            request.user.set_password(
                serializer.validated_data['nouveau_mdp']
            )
            request.user.save()
            return Response({"detail": "Mot de passe modifié avec succès."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)