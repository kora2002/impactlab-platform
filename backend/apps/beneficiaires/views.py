from rest_framework import generics, permissions
from .models import Beneficiaire, Structure, MembreStructure
from .serializers import (
    BeneficiaireSerializer,
    BeneficiaireListSerializer,
    BeneficiaireHistoriqueSerializer,
    StructureSerializer,
    StructureListSerializer,
    MembreStructureSerializer,
)


class BeneficiaireListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/beneficiaires/   → liste (avec recherche)
    POST /api/beneficiaires/   → créer une fiche
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Beneficiaire.objects.all().order_by('nom')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BeneficiaireListSerializer
        return BeneficiaireSerializer
 
     # Filtres
     
    def get_queryset(self):
        qs = Beneficiaire.objects.all().order_by('nom')
        # Recherche simple par nom, téléphone ou localité
        recherche = self.request.query_params.get('recherche')
        if recherche:
            from django.db.models import Q
            qs = qs.filter(
                Q(nom__icontains=recherche) |
                Q(prenom__icontains=recherche) |
                Q(telephone__icontains=recherche) |
                Q(localite__icontains=recherche)
            )
        # Filtre par genre
        genre = self.request.query_params.get('genre')
        if genre:
            qs = qs.filter(genre=genre)
        return qs


class BeneficiaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/DELETE /api/beneficiaires/<id>/
    """
    serializer_class   = BeneficiaireSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = Beneficiaire.objects.all()


class BeneficiaireHistoriqueView(generics.RetrieveAPIView):
    """
    GET /api/beneficiaires/<id>/historique/
    Vision consolidée multi-programmes d'un bénéficiaire
    """
    serializer_class   = BeneficiaireHistoriqueSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = Beneficiaire.objects.all()


class StructureListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/structures/   → liste les structures
    POST /api/structures/   → créer une structure
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Structure.objects.all().order_by('nom')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return StructureListSerializer
        return StructureSerializer

    def get_queryset(self):
        qs = Structure.objects.all().order_by('nom')
        type_structure = self.request.query_params.get('type')
        if type_structure:
            qs = qs.filter(type=type_structure)
        return qs


class StructureDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = StructureSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = Structure.objects.all()


class AjouterMembreStructureView(generics.CreateAPIView):
    """
    POST /api/structures/<structure_id>/membres/
    Rattache un bénéficiaire à une structure (porteur, membre...)
    """
    serializer_class   = MembreStructureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        structure = Structure.objects.get(id=self.kwargs['structure_id'])
        serializer.save(structure=structure)