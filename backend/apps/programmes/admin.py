from django.contrib import admin
from .models import Programme, Etape, Cohorte

@admin.register(Programme)
class ProgrammeAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'type', 'statut', 'date_debut', 'localite']
    list_filter   = ['type', 'statut']
    search_fields = ['nom']

@admin.register(Etape)
class EtapeAdmin(admin.ModelAdmin):
    list_display = ['nom', 'programme', 'ordre', 'validation_requise']
    list_filter  = ['programme']

@admin.register(Cohorte)
class CohorteAdmin(admin.ModelAdmin):
    list_display = ['nom', 'programme', 'date_debut', 'capacite']
    list_filter  = ['programme']