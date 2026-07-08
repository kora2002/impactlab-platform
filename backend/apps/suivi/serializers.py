from rest_framework import serializers
from .models import SuiviInsertion


class SuiviInsertionSerializer(serializers.ModelSerializer):
    beneficiaire_nom = serializers.CharField(source='beneficiaire.nom_complet', read_only=True)
    programme_nom    = serializers.CharField(source='programme.nom', read_only=True)
    jalon_display    = serializers.CharField(source='get_jalon_display', read_only=True)
    statut_display   = serializers.CharField(source='get_statut_insertion_display', read_only=True)

    class Meta:
        model  = SuiviInsertion
        fields = [
            'id', 'beneficiaire', 'beneficiaire_nom',
            'programme', 'programme_nom',
            'jalon', 'jalon_display',
            'statut_insertion', 'statut_display',
            'date_suivi', 'date_relance', 'notes'
        ]
        read_only_fields = ['id', 'date_suivi']