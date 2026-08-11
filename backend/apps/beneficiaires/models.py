from django.db import models


class Beneficiaire(models.Model):

    class Genre(models.TextChoices):
        HOMME  = 'homme',  'Homme'
        FEMME  = 'femme',  'Femme'

    class StatutPro(models.TextChoices):
        ETUDIANT         = 'etudiant',         'Étudiant'
        DEMANDEUR_EMPLOI = 'demandeur_emploi',  "Demandeur d'emploi"
        ENTREPRENEUR     = 'entrepreneur',      'Entrepreneur'
        SALARIE          = 'salarie',           'Salarié'
        SANS_EMPLOI      = 'sans_emploi',       'Sans emploi'

    # Identité
    nom            = models.CharField(max_length=100)
    prenom         = models.CharField(max_length=100)
    genre          = models.CharField(max_length=10, choices=Genre.choices)
    date_naissance = models.DateField(null=True, blank=True)
    nationalite    = models.CharField(max_length=100, blank=True)

    # Coordonnées
    telephone      = models.CharField(max_length=20)
    email          = models.EmailField(blank=True)
    localite       = models.CharField(max_length=200, blank=True)
    quartier       = models.CharField(max_length=200, blank=True)

    # Situation
    niveau_etudes  = models.CharField(max_length=100, blank=True)
    statut_pro     = models.CharField(max_length=20, choices=StatutPro.choices, blank=True)
    experience     = models.TextField(blank=True)

    # Contact d'urgence
    contact_urgence_nom = models.CharField(max_length=200, blank=True)
    contact_urgence_tel = models.CharField(max_length=20, blank=True)

    # Documents
    cv             = models.FileField(upload_to='cvs/', blank=True, null=True)
    piece_identite = models.FileField(upload_to='pieces/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} {self.prenom}"

    @property
    def nom_complet(self):
        return f"{self.nom} {self.prenom}"


class Structure(models.Model):

    class Type(models.TextChoices):
        ASSOCIATION   = 'association',   'Association'
        ENTREPRISE    = 'entreprise',    'Entreprise incubée'
        ETABLISSEMENT = 'etablissement', 'Établissement scolaire'

    class Source(models.TextChoices):
        MANUEL   = 'manuel',   'Saisie manuelle'
        ASSO_PRO = 'asso_pro', 'ASSO-PRO'
        SAGEO    = 'sageo',    'SAGEO/IGBS'

    nom           = models.CharField(max_length=200)
    type          = models.CharField(max_length=20, choices=Type.choices)
    secteur       = models.CharField(max_length=200, blank=True)
    description   = models.TextField(blank=True)
    contact_nom   = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_tel   = models.CharField(max_length=20, blank=True)

    # Niveau de professionnalisation (récupéré depuis ASSO-PRO)
    niveau_professionnalisation = models.CharField(
        max_length=200,
        blank=True,
        default="",
        verbose_name="Niveau de professionnalisation"
    )

    # Source d'import
    source = models.CharField(
        max_length=20,
        choices=Source.choices,
        default='manuel',
        verbose_name="Source"
    )

    # Membres / porteurs de projet
    membres = models.ManyToManyField(
        Beneficiaire,
        through='MembreStructure',
        related_name='structures'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} ({self.get_type_display()})"


class MembreStructure(models.Model):

    class Role(models.TextChoices):
        PORTEUR      = 'porteur',      'Porteur de projet'
        COFONDATEUR  = 'cofondateur',  'Co-fondateur'
        MEMBRE       = 'membre',       'Membre'
        REPRESENTANT = 'representant', 'Représentant'

    beneficiaire = models.ForeignKey(Beneficiaire, on_delete=models.CASCADE)
    structure    = models.ForeignKey(Structure, on_delete=models.CASCADE)
    role         = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBRE)
    date_entree  = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ['beneficiaire', 'structure']

    def __str__(self):
        return f"{self.beneficiaire} — {self.structure} ({self.get_role_display()})"