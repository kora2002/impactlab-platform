from rest_framework.permissions import BasePermission


class EstDirection(BasePermission):
    """Seule la Direction peut accéder"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'direction'


class EstDirectionOuMERL(BasePermission):
    """Direction ou Agent MERL"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['direction', 'merl']


class EstResponsableOuPlus(BasePermission):
    """Responsable programme, MERL ou Direction"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['direction', 'merl', 'responsable']


class EstFinancesOuDirection(BasePermission):
    """Admin Finances ou Direction"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['direction', 'finances']


class LectureSeulementSaufDirection(BasePermission):
    """Lecture pour tous, écriture pour Direction seulement"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user.role == 'direction'