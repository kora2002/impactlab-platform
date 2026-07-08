from rest_framework import serializers
from .models import Bailleur, Financement


class BailleurSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model  = Bailleur
        fields = ['id', 'nom', 'type', 'type_display', 'contact', 'email', 'pays']


class FinancementSerializer(serializers.ModelSerializer):
    programme_nom  = serializers.CharField(source='programme.nom', read_only=True)
    bailleur_nom   = serializers.CharField(source='bailleur.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    taux_execution = serializers.FloatField(read_only=True)

    class Meta:
        model  = Financement
        fields = [
            'id', 'programme', 'programme_nom',
            'bailleur', 'bailleur_nom',
            'montant_prevu', 'montant_realise', 'taux_execution',
            'date_debut', 'echeance', 'convention_ref',
            'statut', 'statut_display', 'notes'
        ]
        read_only_fields = ['id']