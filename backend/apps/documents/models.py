from django.db import models
from apps.beneficiaires.models import Beneficiaire, Structure
from apps.inscriptions.models import Progression


class Document(models.Model):

    class TypeDoc(models.TextChoices):
        CV              = 'cv',             'CV'
        PIECE_IDENTITE  = 'piece_identite', "Pièce d'identité"
        CERTIFICAT      = 'certificat',     'Certificat'
        PHOTO           = 'photo',          'Photo'
        LIVRABLE        = 'livrable',       'Livrable'
        RAPPORT         = 'rapport',        'Rapport'
        CONVENTION      = 'convention',     'Convention'
        AUTRE           = 'autre',          'Autre'

    nom          = models.CharField(max_length=200)
    type_doc     = models.CharField(max_length=20, choices=TypeDoc.choices, default=TypeDoc.AUTRE)
    fichier      = models.FileField(upload_to='documents/%Y/%m/')
    date_upload  = models.DateTimeField(auto_now_add=True)
    description  = models.TextField(blank=True)

    # Lié à un bénéficiaire, une structure ou une étape (optionnel)
    beneficiaire = models.ForeignKey(Beneficiaire, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    structure    = models.ForeignKey(Structure, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    progression  = models.ForeignKey(Progression, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')

    def __str__(self):
        return f"{self.nom} ({self.get_type_doc_display()})"