from rest_framework import generics, permissions
from django.db.models import Count, Q
from .models import SuiviInsertion
from apps.beneficiaires.models import Beneficiaire
from .serializers import SuiviInsertionSerializer


class SuiviInsertionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/suivi/   → liste les suivis d'insertion
    POST /api/suivi/   → enregistrer un suivi (3/6/12 mois)
    """
    serializer_class   = SuiviInsertionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = SuiviInsertion.objects.all().order_by('-date_suivi')
        programme_id = self.request.query_params.get('programme')
        if programme_id:
            qs = qs.filter(programme_id=programme_id)
        jalon = self.request.query_params.get('jalon')
        if jalon:
            qs = qs.filter(jalon=jalon)
        return qs


class SuiviInsertionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SuiviInsertionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = SuiviInsertion.objects.all()


class IndicateurParite(generics.GenericAPIView):
    """
    GET /api/suivi/parite/?programme=<id>
    Calcule le taux de femmes (cible >= 43%)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Beneficiaire.objects.all()
        programme_id = request.query_params.get('programme')
        if programme_id:
            qs = qs.filter(inscriptions__cohorte__programme_id=programme_id).distinct()

        total  = qs.count()
        femmes = qs.filter(genre='femme').count()
        taux   = round((femmes / total) * 100, 2) if total > 0 else 0

        from rest_framework.response import Response
        return Response({
            "total_beneficiaires": total,
            "nombre_femmes": femmes,
            "taux_parite": taux,
            "objectif": 43,
            "atteint": taux >= 43,
        })