from django.db import models
from apps.programmes.models import Programme


class Bailleur(models.Model):

    class Type(models.TextChoices):
        INSTITUTION   = 'institution',  'Institution publique'
        FONDATION     = 'fondation',    'Fondation'
        AGENCE        = 'agence',       'Agence de coopération'
        ENTREPRISE    = 'entreprise',   'Entreprise privée'
        AUTRE         = 'autre',        'Autre'

    nom     = models.CharField(max_length=200)
    type    = models.CharField(max_length=20, choices=Type.choices)
    contact = models.CharField(max_length=200, blank=True)
    email   = models.EmailField(blank=True)
    pays    = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.nom} ({self.get_type_display()})"


class Financement(models.Model):

    class Statut(models.TextChoices):
        EN_COURS  = 'en_cours',  'En cours'
        TERMINE   = 'termine',   'Terminé'
        SUSPENDU  = 'suspendu',  'Suspendu'

    programme        = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='financements')
    bailleur         = models.ForeignKey(Bailleur, on_delete=models.CASCADE, related_name='financements')
    montant_prevu    = models.DecimalField(max_digits=15, decimal_places=2)
    montant_realise  = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    date_debut       = models.DateField()
    echeance         = models.DateField(null=True, blank=True)
    convention_ref   = models.CharField(max_length=200, blank=True)
    statut           = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_COURS)
    notes            = models.TextField(blank=True)

    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.programme} — {self.bailleur} ({self.montant_prevu} FCFA)"

    @property
    def taux_execution(self):
        if self.montant_prevu == 0:
            return 0
        return round((self.montant_realise / self.montant_prevu) * 100, 2)