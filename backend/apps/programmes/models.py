from django.db import models
from apps.users.models import Utilisateur


class Programme(models.Model):

    class Type(models.TextChoices):
        INSERTION   = 'insertion',   'Insertion / Emploi'
        INCUBATION  = 'incubation',  'Incubation / Entrepreneuriat'
        EDUCATION   = 'education',   'Éducation'
        CONSEIL     = 'conseil',     'Conseil / Accompagnement'

    class Statut(models.TextChoices):
        ACTIF    = 'actif',    'Actif'
        TERMINE  = 'termine',  'Terminé'
        SUSPENDU = 'suspendu', 'Suspendu'

    nom         = models.CharField(max_length=200)
    type        = models.CharField(max_length=20, choices=Type.choices)
    description = models.TextField(blank=True)
    objectifs   = models.TextField(blank=True)
    date_debut  = models.DateField()
    date_fin    = models.DateField(null=True, blank=True)
    statut      = models.CharField(max_length=20, choices=Statut.choices, default=Statut.ACTIF)
    localite    = models.CharField(max_length=200, blank=True)
    responsable = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, related_name='programmes')

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom


class Etape(models.Model):
    programme          = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='etapes')
    nom                = models.CharField(max_length=200)
    ordre              = models.PositiveIntegerField()
    description        = models.TextField(blank=True)
    validation_requise = models.BooleanField(default=False)

    class Meta:
        ordering = ['ordre']
        unique_together = ['programme', 'ordre']

    def __str__(self):
        return f"{self.programme.nom} — Étape {self.ordre} : {self.nom}"


class Cohorte(models.Model):
    programme  = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='cohortes')
    nom        = models.CharField(max_length=200)
    date_debut = models.DateField()
    date_fin   = models.DateField(null=True, blank=True)
    capacite   = models.PositiveIntegerField(default=30)

    def __str__(self):
        return f"{self.programme.nom} — {self.nom}"

    @property
    def est_complete(self):
        return self.inscriptions.count() >= self.capacite