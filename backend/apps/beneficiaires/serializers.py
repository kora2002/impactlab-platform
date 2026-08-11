from rest_framework import serializers
from .models import Beneficiaire, Structure, MembreStructure


class BeneficiaireSerializer(serializers.ModelSerializer):
    genre_display      = serializers.CharField(source='get_genre_display', read_only=True)
    statut_pro_display = serializers.CharField(source='get_statut_pro_display', read_only=True)
    nom_complet        = serializers.CharField(read_only=True)

    class Meta:
        model  = Beneficiaire
        fields = [
            'id', 'nom', 'prenom', 'nom_complet',
            'genre', 'genre_display',
            'date_naissance', 'nationalite',
            'telephone', 'email', 'localite', 'quartier',
            'niveau_etudes', 'statut_pro', 'statut_pro_display', 'experience',
            'contact_urgence_nom', 'contact_urgence_tel',
            'cv', 'piece_identite',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BeneficiaireListSerializer(serializers.ModelSerializer):
    genre_display     = serializers.CharField(source='get_genre_display', read_only=True)
    nom_complet       = serializers.CharField(read_only=True)
    nombre_programmes = serializers.SerializerMethodField()

    class Meta:
        model  = Beneficiaire
        fields = [
            'id', 'nom_complet', 'genre', 'genre_display',
            'telephone', 'localite', 'statut_pro',
            'nombre_programmes'
        ]

    def get_nombre_programmes(self, obj):
        return obj.inscriptions.values('cohorte__programme').distinct().count()


class BeneficiaireHistoriqueSerializer(serializers.ModelSerializer):
    genre_display = serializers.CharField(source='get_genre_display', read_only=True)
    inscriptions  = serializers.SerializerMethodField()

    class Meta:
        model  = Beneficiaire
        fields = [
            'id', 'nom', 'prenom', 'genre', 'genre_display',
            'telephone', 'email', 'localite',
            'contact_urgence_nom', 'contact_urgence_tel',
            'inscriptions'
        ]

    def get_inscriptions(self, obj):
        result = []
        for inscription in obj.inscriptions.all():
            result.append({
                'programme':          inscription.cohorte.programme.nom,
                'cohorte':            inscription.cohorte.nom,
                'statut_inscription': inscription.get_statut_display(),
                'date_inscription':   inscription.date_inscription,
            })
        return result


class MembreStructureSerializer(serializers.ModelSerializer):
    beneficiaire_nom = serializers.CharField(source='beneficiaire.nom_complet', read_only=True)
    role_display     = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model  = MembreStructure
        fields = [
            'id', 'beneficiaire', 'beneficiaire_nom',
            'role', 'role_display', 'date_entree'
        ]


class StructureSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_type_display', read_only=True)
    membres_detail = MembreStructureSerializer(
        source='membrestructure_set', many=True, read_only=True
    )

    class Meta:
        model  = Structure
        fields = [
            'id', 'nom', 'type', 'type_display',
            'secteur', 'description',
            'niveau_professionnalisation',
            'contact_nom', 'contact_email', 'contact_tel',
            'membres_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StructureListSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_type_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    nombre_membres = serializers.SerializerMethodField()

    class Meta:
        model  = Structure
        fields = [
            'id', 'nom', 'type', 'type_display',
            'secteur', 'nombre_membres',
            'niveau_professionnalisation',
            'source', 'source_display',
        ]

    def get_nombre_membres(self, obj):
        return obj.membres.count()