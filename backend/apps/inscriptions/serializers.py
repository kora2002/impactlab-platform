from rest_framework import serializers
from django.utils import timezone
from .models import Inscription, Progression


class ProgressionSerializer(serializers.ModelSerializer):
    etape_nom    = serializers.CharField(source='etape.nom', read_only=True)
    etape_ordre  = serializers.IntegerField(source='etape.ordre', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model  = Progression
        fields = [
            'id', 'etape', 'etape_nom', 'etape_ordre',
            'date_entree', 'date_sortie', 'statut', 'statut_display',
            'valideur', 'commentaire'
        ]
        read_only_fields = ['id', 'date_entree']


class InscriptionSerializer(serializers.ModelSerializer):
    beneficiaire_nom = serializers.CharField(source='beneficiaire.nom_complet', read_only=True)
    programme_nom    = serializers.CharField(source='cohorte.programme.nom', read_only=True)
    cohorte_nom      = serializers.CharField(source='cohorte.nom', read_only=True)
    statut_display   = serializers.CharField(source='get_statut_display', read_only=True)
    progressions     = ProgressionSerializer(many=True, read_only=True)

    class Meta:
        model  = Inscription
        fields = [
            'id', 'beneficiaire', 'beneficiaire_nom',
            'cohorte', 'cohorte_nom', 'programme_nom',
            'date_inscription', 'statut', 'statut_display',
            'valideur', 'date_validation', 'motif_rejet',
            'progressions'
        ]
        read_only_fields = ['id', 'date_inscription']


class ValiderInscriptionSerializer(serializers.Serializer):
    """
    Serializer pour valider ou rejeter une inscription
    """
    action      = serializers.ChoiceField(choices=['valider', 'rejeter'])
    motif_rejet = serializers.CharField(required=False, allow_blank=True)


class AvancerEtapeSerializer(serializers.Serializer):
    """
    Serializer pour faire avancer un bénéficiaire à l'étape suivante
    """
    etape_id    = serializers.IntegerField()
    commentaire = serializers.CharField(required=False, allow_blank=True)


class AbandonnerSerializer(serializers.Serializer):
    motif = serializers.CharField()