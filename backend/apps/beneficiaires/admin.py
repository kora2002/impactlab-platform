from django.contrib import admin
from .models import Beneficiaire, Structure, MembreStructure

@admin.register(Beneficiaire)
class BeneficiaireAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'prenom', 'genre', 'telephone', 'localite', 'statut_pro']
    list_filter   = ['genre', 'statut_pro', 'localite']
    search_fields = ['nom', 'prenom', 'telephone', 'email']

@admin.register(Structure)
class StructureAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'type', 'secteur']
    list_filter   = ['type']
    search_fields = ['nom']

admin.site.register(MembreStructure)