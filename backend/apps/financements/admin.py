from django.contrib import admin
from .models import Bailleur, Financement

@admin.register(Bailleur)
class BailleurAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'type', 'pays']
    search_fields = ['nom']

@admin.register(Financement)
class FinancementAdmin(admin.ModelAdmin):
    list_display  = ['programme', 'bailleur', 'montant_prevu', 'montant_realise', 'statut']
    list_filter   = ['statut']