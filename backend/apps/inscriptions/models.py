from django.db import models
from apps.beneficiaires.models import Beneficiaire
from apps.programmes.models import Cohorte, Etape
from apps.users.models import Utilisateur


class Inscription(models.Model):

    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        VALIDEE    = 'validee',    'Validée'
        REJETEE    = 'rejetee',    'Rejetée'

    beneficiaire    = models.ForeignKey(Beneficiaire, on_delete=models.CASCADE, related_name='inscriptions')
    cohorte         = models.ForeignKey(Cohorte, on_delete=models.CASCADE, related_name='inscriptions')
    date_inscription= models.DateTimeField(auto_now_add=True)
    statut          = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    valideur        = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, related_name='inscriptions_validees')
    date_validation = models.DateTimeField(null=True, blank=True)
    motif_rejet     = models.TextField(blank=True)

    class Meta:
        unique_together = ['beneficiaire', 'cohorte']

    def __str__(self):
        return f"{self.beneficiaire} — {self.cohorte} ({self.get_statut_display()})"


class Progression(models.Model):

    class Statut(models.TextChoices):
        EN_COURS            = 'en_cours',            'En cours'
        TERMINE             = 'termine',             'Terminé'
        ABANDONNE           = 'abandonne',           'Abandonné'
        EN_ATTENTE_VALID    = 'en_attente_valid',    'En attente de validation'

    inscription = models.ForeignKey(Inscription, on_delete=models.CASCADE, related_name='progressions')
    etape       = models.ForeignKey(Etape, on_delete=models.CASCADE, related_name='progressions')
    date_entree = models.DateField(auto_now_add=True)
    date_sortie = models.DateField(null=True, blank=True)
    statut      = models.CharField(max_length=25, choices=Statut.choices, default=Statut.EN_COURS)
    valideur    = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, related_name='progressions_validees')
    commentaire = models.TextField(blank=True)

    class Meta:
        unique_together = ['inscription', 'etape']
        ordering        = ['etape__ordre']

    def __str__(self):
        return f"{self.inscription.beneficiaire} — {self.etape.nom} ({self.get_statut_display()})"