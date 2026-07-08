from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Inscription, Progression
from apps.programmes.models import Etape
from .serializers import (
    InscriptionSerializer,
    ProgressionSerializer,
    ValiderInscriptionSerializer,
    AvancerEtapeSerializer,
    AbandonnerSerializer,
)


class InscriptionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inscriptions/   → liste les inscriptions
    POST /api/inscriptions/   → inscrire un bénéficiaire
    """
    serializer_class   = InscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Inscription.objects.all().order_by('-date_inscription')
        # Filtre par programme
        programme_id = self.request.query_params.get('programme')
        if programme_id:
            qs = qs.filter(cohorte__programme_id=programme_id)
        # Filtre par statut
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)
        return qs

    def perform_create(self, serializer):
        inscription = serializer.save()
        # Crée automatiquement la première progression sur la 1ère étape du programme
        premiere_etape = inscription.cohorte.programme.etapes.order_by('ordre').first()
        if premiere_etape:
            Progression.objects.create(
                inscription=inscription,
                etape=premiere_etape
            )


class InscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = InscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = Inscription.objects.all()


class ValiderInscriptionView(APIView):
    """
    POST /api/inscriptions/<id>/valider/
    Valide ou rejette une inscription (responsable de programme)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        inscription = Inscription.objects.get(pk=pk)
        serializer  = ValiderInscriptionSerializer(data=request.data)

        if serializer.is_valid():
            action = serializer.validated_data['action']

            if action == 'valider':
                inscription.statut = Inscription.Statut.VALIDEE
                inscription.valideur = request.user
                inscription.date_validation = timezone.now()
            else:
                inscription.statut = Inscription.Statut.REJETEE
                inscription.motif_rejet = serializer.validated_data.get('motif_rejet', '')
                inscription.valideur = request.user
                inscription.date_validation = timezone.now()

            inscription.save()
            return Response(InscriptionSerializer(inscription).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvancerEtapeView(APIView):
    """
    POST /api/inscriptions/<id>/avancer/
    Fait passer le bénéficiaire à l'étape suivante
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        inscription = Inscription.objects.get(pk=pk)
        serializer  = AvancerEtapeSerializer(data=request.data)

        if serializer.is_valid():
            nouvelle_etape_id = serializer.validated_data['etape_id']
            nouvelle_etape    = Etape.objects.get(id=nouvelle_etape_id)

            # Clôture la progression actuelle (en cours)
            progression_actuelle = inscription.progressions.filter(
                statut=Progression.Statut.EN_COURS
            ).first()
            if progression_actuelle:
                progression_actuelle.statut      = Progression.Statut.TERMINE
                progression_actuelle.date_sortie = timezone.now().date()
                progression_actuelle.save()

            # Crée la nouvelle progression
            nouvelle_progression = Progression.objects.create(
                inscription=inscription,
                etape=nouvelle_etape,
                valideur=request.user,
                commentaire=serializer.validated_data.get('commentaire', '')
            )

            return Response(ProgressionSerializer(nouvelle_progression).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AbandonnerView(APIView):
    """
    POST /api/inscriptions/<id>/abandonner/
    Marque le parcours comme abandonné
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        inscription = Inscription.objects.get(pk=pk)
        serializer  = AbandonnerSerializer(data=request.data)

        if serializer.is_valid():
            progression_actuelle = inscription.progressions.filter(
                statut=Progression.Statut.EN_COURS
            ).first()
            if progression_actuelle:
                progression_actuelle.statut      = Progression.Statut.ABANDONNE
                progression_actuelle.date_sortie = timezone.now().date()
                progression_actuelle.commentaire = serializer.validated_data['motif']
                progression_actuelle.save()

            return Response({"detail": "Abandon enregistré."})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)