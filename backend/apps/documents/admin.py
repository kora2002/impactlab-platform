from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'type_doc', 'beneficiaire', 'date_upload']
    list_filter   = ['type_doc']
    search_fields = ['nom']