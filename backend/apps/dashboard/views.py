from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from apps.beneficiaires.models import Beneficiaire
from apps.programmes.models import Programme
from apps.inscriptions.models import Inscription, Progression
from apps.suivi.models import SuiviInsertion
from apps.financements.models import Financement


class DashboardView(APIView):
    """
    GET /api/dashboard/
    Agrège tous les indicateurs d'impact en une seule requête
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ── 1. BÉNÉFICIAIRES ──────────────────────────────────────
        total_beneficiaires = Beneficiaire.objects.count()
        nombre_femmes       = Beneficiaire.objects.filter(genre='femme').count()
        nombre_hommes       = Beneficiaire.objects.filter(genre='homme').count()
        taux_parite         = round((nombre_femmes / total_beneficiaires) * 100, 2) if total_beneficiaires > 0 else 0

        # ── 2. PROGRAMMES ─────────────────────────────────────────
        total_programmes    = Programme.objects.count()
        programmes_actifs   = Programme.objects.filter(statut='actif').count()
        programmes_incubation = Programme.objects.filter(type='incubation').count()

        # ── 3. INSCRIPTIONS ───────────────────────────────────────
        total_inscriptions  = Inscription.objects.count()
        inscriptions_validees = Inscription.objects.filter(statut='validee').count()
        inscriptions_attente  = Inscription.objects.filter(statut='en_attente').count()

        # ── 4. ABANDONS ───────────────────────────────────────────
        total_abandons = Progression.objects.filter(statut='abandonne').count()
        taux_abandon   = round((total_abandons / total_inscriptions) * 100, 2) if total_inscriptions > 0 else 0

        # ── 5. INSERTIONS (suivi 3/6/12 mois) ────────────────────
        total_inseres = SuiviInsertion.objects.exclude(
            statut_insertion__in=['non_repondu', 'sans_solution']
        ).values('beneficiaire').distinct().count()

        taux_insertion = round((total_inseres / total_beneficiaires) * 100, 2) if total_beneficiaires > 0 else 0

        insertions_par_statut = SuiviInsertion.objects.values(
            'statut_insertion'
        ).annotate(total=Count('id'))

        # ── 6. FINANCEMENTS ───────────────────────────────────────
        total_prevu   = Financement.objects.aggregate(t=Sum('montant_prevu'))['t'] or 0
        total_realise = Financement.objects.aggregate(t=Sum('montant_realise'))['t'] or 0
        taux_execution_global = round((total_realise / total_prevu) * 100, 2) if total_prevu > 0 else 0

        # ── 7. RÉPARTITION PAR LOCALITÉ ──────────────────────────
        repartition_localite = Beneficiaire.objects.values(
            'localite'
        ).annotate(
            total=Count('id'),
            femmes=Count('id', filter=Q(genre='femme'))
        ).order_by('-total')

        # ── 8. ÉVOLUTION MENSUELLE ────────────────────────────────
        from django.db.models.functions import TruncMonth
        evolution_mensuelle = Inscription.objects.annotate(
            mois=TruncMonth('date_inscription')
        ).values('mois').annotate(
            total=Count('id')
        ).order_by('mois')

        # ── RÉPONSE FINALE ────────────────────────────────────────
        return Response({
            "beneficiaires": {
                "total": total_beneficiaires,
                "femmes": nombre_femmes,
                "hommes": nombre_hommes,
                "taux_parite": taux_parite,
                "objectif_parite": 43,
                "parite_atteinte": taux_parite >= 43,
            },
            "programmes": {
                "total": total_programmes,
                "actifs": programmes_actifs,
                "incubation": programmes_incubation,
            },
            "inscriptions": {
                "total": total_inscriptions,
                "validees": inscriptions_validees,
                "en_attente": inscriptions_attente,
                "taux_abandon": taux_abandon,
            },
            "insertion": {
                "total_inseres": total_inseres,
                "taux_insertion": taux_insertion,
                "par_statut": list(insertions_par_statut),
            },
            "financements": {
                "total_prevu": total_prevu,
                "total_realise": total_realise,
                "taux_execution": taux_execution_global,
            },
            "repartition_localite": list(repartition_localite),
            "evolution_mensuelle": [
                {
                    "mois": item['mois'].strftime('%Y-%m') if item['mois'] else None,
                    "total": item['total']
                }
                for item in evolution_mensuelle
            ],
        })


class DashboardProgrammeView(APIView):
    """
    GET /api/dashboard/programme/<id>/
    Indicateurs détaillés pour un programme spécifique
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, programme_id):
        try:
            programme = Programme.objects.get(id=programme_id)
        except Programme.DoesNotExist:
            return Response({"detail": "Programme non trouvé."}, status=404)

        inscriptions = Inscription.objects.filter(
            cohorte__programme=programme
        )
        total = inscriptions.count()
        beneficiaires_ids = inscriptions.values_list('beneficiaire_id', flat=True)
        beneficiaires = Beneficiaire.objects.filter(id__in=beneficiaires_ids)

        femmes = beneficiaires.filter(genre='femme').count()
        taux_parite = round((femmes / total) * 100, 2) if total > 0 else 0

        abandons = Progression.objects.filter(
            inscription__cohorte__programme=programme,
            statut='abandonne'
        ).count()

        return Response({
            "programme": programme.nom,
            "type": programme.get_type_display(),
            "statut": programme.get_statut_display(),
            "total_inscrits": total,
            "femmes": femmes,
            "taux_parite": taux_parite,
            "abandons": abandons,
            "nombre_etapes": programme.etapes.count(),
            "nombre_cohortes": programme.cohortes.count(),
        })