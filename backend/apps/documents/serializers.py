from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    type_doc_display = serializers.CharField(source='get_type_doc_display', read_only=True)

    class Meta:
        model  = Document
        fields = [
            'id', 'nom', 'type_doc', 'type_doc_display',
            'fichier', 'date_upload', 'description',
            'beneficiaire', 'structure', 'progression'
        ]
        read_only_fields = ['id', 'date_upload']