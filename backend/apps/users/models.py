from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):

    class Role(models.TextChoices):
        DIRECTION   = 'direction',   'Direction / Admin'
        RESPONSABLE = 'responsable', 'Responsable programme'
        MERL        = 'merl',        'Agent MERL'
        FINANCES    = 'finances',    'Admin / Finances'
        TERRAIN     = 'terrain',     'Agent terrain'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.TERRAIN,
    )
    telephone = models.CharField(max_length=20, blank=True)
    
    #fonction qui me sert a afficher le nom complet de l'utilisateur avec son role
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    #me premet de faire un calcule
    @property 
    def is_direction(self):
        return self.role == self.Role.DIRECTION

    @property
    def is_merl(self):
        return self.role == self.Role.MERL