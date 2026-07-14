from rest_framework import serializers
from .models import Programme, Etape, Cohorte
from django.db.models import Count


class EtapeSerializer(serializers.ModelSerializer):
    """
    Serializer pour les étapes d'un programme
    Ex: Écoute, Diagnostic, Formation, Insertion
    """
    class Meta:
        model  = Etape
        fields = [
            'id', 'nom', 'ordre',
            'description', 'validation_requise'
        ]


class CohorteSerializer(serializers.ModelSerializer):
    """
    Serializer pour les cohortes/promotions
    Ex: IGBS Janvier 2026, VIA Édition 3
    """
    # Champ calculé : nombre d'inscrits dans cette cohorte
    nombre_inscrits = serializers.SerializerMethodField()

    class Meta:
        model  = Cohorte
        fields = [
            'id', 'nom', 'date_debut',
            'date_fin', 'capacite', 'nombre_inscrits'
        ]

    def get_nombre_inscrits(self, obj):
        # obj = la cohorte en cours de sérialisation
        return obj.inscriptions.count()


class ProgrammeSerializer(serializers.ModelSerializer):
    """
    Serializer principal pour afficher un programme
    avec ses étapes et cohortes incluses
    """
    etapes  = EtapeSerializer(many=True, read_only=True)
    cohortes = CohorteSerializer(many=True, read_only=True)

    # Affiche le label lisible au lieu du code
    # Ex: "Incubation / Entrepreneuriat" au lieu de "incubation"
    type_display   = serializers.CharField(source='get_type_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    # Nom du responsable
    responsable_nom = serializers.CharField(
        source='responsable.get_full_name',
        read_only=True
    )

    class Meta:
        model  = Programme
        fields = [
            'id', 'nom', 'type', 'type_display',
            'description', 'objectifs',
            'date_debut', 'date_fin',
            'statut', 'statut_display',
            'localite', 'responsable', 'responsable_nom',
            'etapes', 'cohortes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProgrammeListSerializer(serializers.ModelSerializer):
    """
    Serializer allégé pour la liste des programmes
    (sans les étapes et cohortes pour aller plus vite)
    """
    type_display   = serializers.CharField(source='get_type_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    nombre_beneficiaires = serializers.SerializerMethodField()

    class Meta:
        model  = Programme
        fields = [
            'id', 'nom', 'type', 'type_display',
            'statut', 'statut_display',
            'date_debut', 'date_fin', 'localite',
            'nombre_beneficiaires'
        ]

    def get_nombre_beneficiaires(self, obj):
        return obj.cohortes.aggregate(
            total=Count('inscriptions')
        )['total'] or 0