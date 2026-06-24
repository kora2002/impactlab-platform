from django.db import models
from apps.beneficiaires.models import Beneficiaire
from apps.programmes.models import Programme


class SuiviInsertion(models.Model):

    class Jalon(models.TextChoices):
        MOIS_3  = '3_mois',  'Suivi 3 mois'
        MOIS_6  = '6_mois',  'Suivi 6 mois'
        MOIS_12 = '12_mois', 'Suivi 12 mois'

    class StatutInsertion(models.TextChoices):
        EMPLOI_SALARIE   = 'emploi_salarie',   'Emploi salarié'
        ENTREPRENEURIAT  = 'entrepreneuriat',  'Entrepreneuriat'
        FORMATION        = 'formation',        'Formation continue'
        SANS_SOLUTION    = 'sans_solution',    'Sans solution'
        NON_REPONDU      = 'non_repondu',      'Non répondu'

    beneficiaire     = models.ForeignKey(Beneficiaire, on_delete=models.CASCADE, related_name='suivis_insertion')
    programme        = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='suivis_insertion')
    #jalon represente ici un point de contrôle dans le temps
    jalon            = models.CharField(max_length=10, choices=Jalon.choices)
    statut_insertion = models.CharField(max_length=20, choices=StatutInsertion.choices, default=StatutInsertion.NON_REPONDU)
    date_suivi       = models.DateField(auto_now_add=True)
    date_relance     = models.DateField(null=True, blank=True)
    notes            = models.TextField(blank=True)

    class Meta:
        unique_together = ['beneficiaire', 'programme', 'jalon']

    def __str__(self):
        return f"{self.beneficiaire} — {self.programme} ({self.get_jalon_display()})"