from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum
from .models import Bailleur, Financement
from .serializers import BailleurSerializer, FinancementSerializer
from apps.users.permissions import EstFinancesOuDirection, EstDirectionOuMERL


class BailleurListCreateView(generics.ListCreateAPIView):
    serializer_class   = BailleurSerializer
    permission_classes = [EstFinancesOuDirection]
    queryset           = Bailleur.objects.all().order_by('nom')


class BailleurDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = BailleurSerializer
    permission_classes = [EstFinancesOuDirection]
    queryset           = Bailleur.objects.all()


class FinancementListCreateView(generics.ListCreateAPIView):
    serializer_class   = FinancementSerializer
    permission_classes = [EstFinancesOuDirection]

    def get_queryset(self):
        qs = Financement.objects.all().order_by('-date_debut')
        programme_id = self.request.query_params.get('programme')
        if programme_id:
            qs = qs.filter(programme_id=programme_id)
        return qs


class FinancementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = FinancementSerializer
    permission_classes = [EstFinancesOuDirection]
    queryset           = Financement.objects.all()


class TotalFinancementsView(generics.GenericAPIView):
    """
    GET /api/financements/total/
    Montant total des financements levés (indicateur d'impact)
    """
    permission_classes = [EstDirectionOuMERL]

    def get(self, request):
        total_prevu   = Financement.objects.aggregate(t=Sum('montant_prevu'))['t'] or 0
        total_realise = Financement.objects.aggregate(t=Sum('montant_realise'))['t'] or 0
        return Response({
            "total_prevu":   total_prevu,
            "total_realise": total_realise,
            "taux_global":   round((total_realise / total_prevu) * 100, 2) if total_prevu > 0 else 0
        })