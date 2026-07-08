from rest_framework import generics, permissions
from .models import Document
from .serializers import DocumentSerializer


class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class   = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Document.objects.all().order_by('-date_upload')
        beneficiaire_id = self.request.query_params.get('beneficiaire')
        if beneficiaire_id:
            qs = qs.filter(beneficiaire_id=beneficiaire_id)
        structure_id = self.request.query_params.get('structure')
        if structure_id:
            qs = qs.filter(structure_id=structure_id)
        return qs


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = Document.objects.all()