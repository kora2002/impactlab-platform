from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Programme, Etape, Cohorte
from .serializers import (
    ProgrammeSerializer,
    ProgrammeListSerializer,
    EtapeSerializer,
    CohorteSerializer
)


class ProgrammeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/programmes/        → liste tous les programmes
    POST /api/programmes/        → crée un nouveau programme
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Pour la liste on utilise le serializer allégé
        # Pour la création on utilise le serializer complet
        if self.request.method == 'GET':
            return ProgrammeListSerializer
        return ProgrammeSerializer

    def get_queryset(self):
        user = self.request.user
        # Direction et MERL voient tous les programmes
        if user.role in ['direction', 'merl']:
            return Programme.objects.all().order_by('nom')
        # Les autres ne voient que leurs programmes
        return Programme.objects.filter(
            responsable=user
        ).order_by('nom')


class ProgrammeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/programmes/<id>/  → voir un programme
    PUT    /api/programmes/<id>/  → modifier un programme
    DELETE /api/programmes/<id>/  → supprimer un programme
    """
    serializer_class   = ProgrammeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = Programme.objects.all()


class EtapeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/programmes/<id>/etapes/  → liste les étapes d'un programme
    POST /api/programmes/<id>/etapes/  → ajoute une étape
    """
    serializer_class   = EtapeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Récupère seulement les étapes du programme demandé
        programme_id = self.kwargs['programme_id']
        return Etape.objects.filter(
            programme_id=programme_id
        ).order_by('ordre')

    def perform_create(self, serializer):
        # Associe automatiquement l'étape au bon programme
        programme = Programme.objects.get(
            id=self.kwargs['programme_id']
        )
        serializer.save(programme=programme)


class CohorteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/programmes/<id>/cohortes/  → liste les cohortes
    POST /api/programmes/<id>/cohortes/  → crée une cohorte
    """
    serializer_class   = CohorteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        programme_id = self.kwargs['programme_id']
        return Cohorte.objects.filter(
            programme_id=programme_id
        ).order_by('-date_debut')

    def perform_create(self, serializer):
        programme = Programme.objects.get(
            id=self.kwargs['programme_id']
        )
        serializer.save(programme=programme)