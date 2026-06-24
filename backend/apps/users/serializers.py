from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Utilisateur

# pour AFFICHER un utilisateur
class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Utilisateur
        fields = [
            'id', 'username', 'email',
            'first_name', 'last_name',
            'role', 'telephone', 'is_active'
        ]
        # Ces champs sont visibles mais non modifiables
        read_only_fields = ['id']


# pour CRÉER un utilisateur
class CreerUtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,       # le mot de passe n'est jamais renvoyé en JSON
        validators=[validate_password]
    )

    class Meta:
        model  = Utilisateur
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name',
            'role', 'telephone'
        ]

    def create(self, validated_data):
        # On utilise create_user pour hasher le mot de passe automatiquement
        utilisateur = Utilisateur.objects.create_user(**validated_data)
        return utilisateur


class ChangerMotDePasseSerializer(serializers.Serializer):

    ancien_mdp  = serializers.CharField(write_only=True)
    nouveau_mdp = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    def validate_ancien_mdp(self, value):
        # Vérifie que l'ancien mot de passe est correct
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Ancien mot de passe incorrect.")
        return value