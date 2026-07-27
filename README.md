# Plateforme CRM/M&E — Impact'Lab GDC

Plateforme de gestion des bénéficiaires et de suivi d'impact développée pour Impact'Lab GDC (ONG, Côte d'Ivoire).

## Stack technique

- **Frontend** : React + Vite (port 5173)
- **Backend** : Django 5.2 + Django REST Framework (port 8000)
- **Base de données** : PostgreSQL
- **Authentification** : JWT (djangorestframework-simplejwt)
- **Documentation API** : Swagger — http://localhost:8000/api/docs/

---

## Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

## Installation — Backend Django

```bash
# 1. Aller dans le dossier backend
cd ~/Documents/impactlab-platform/backend

# 2. Activer l'environnement virtuel
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer les variables d'environnement
# Créer un fichier .env avec le contenu suivant :
SECRET_KEY=votre_clé_secrète
DEBUG=True
DATABASE_NAME=impactlab_db
DATABASE_USER=impactlab_user
DATABASE_PASSWORD=impactlab2026
DATABASE_HOST=localhost
DATABASE_PORT=5432

# 5. Créer la base de données PostgreSQL
psql -U postgres -c "CREATE DATABASE impactlab_db;"
psql -U postgres -c "CREATE USER impactlab_user WITH PASSWORD 'impactlab2026';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE impactlab_db TO impactlab_user;"

# 6. Appliquer les migrations
python manage.py migrate

# 7. Créer le superutilisateur
python manage.py createsuperuser

# 8. Lancer le serveur
python manage.py runserver
```

---

## Installation — Frontend React

```bash
# 1. Aller dans le dossier frontend
cd ~/Documents/impactlab-platform/frontend

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

---

## Accès à l'application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Documentation Swagger | http://localhost:8000/api/docs/ |
| Admin Django | http://localhost:8000/admin/ |

---

## Rôles utilisateurs

| Rôle | Accès |
|---|---|
| `direction` | Accès complet |
| `responsable` | Programmes et inscriptions |
| `merl` | Dashboard, reporting, suivi insertion |
| `finances` | Financements et bailleurs |
| `terrain` | Bénéficiaires et programmes |

---

## Modules

- **Dashboard** — Indicateurs d'impact, export PDF/Excel
- **Bénéficiaires** — Fiches, import Excel, import ASSO-PRO
- **Programmes** — Gestion des programmes, étapes, cohortes
- **Inscriptions** — Suivi du parcours, validation, progression
- **Suivi Insertion** — Jalons 3/6/12 mois, indicateur de parité
- **Financements** — Gestion des budgets et bailleurs
- **Documents** — Upload et visualisation des pièces jointes
- **Structures** — Associations et organisations (ASSO-PRO)

---

## Intégration API ASSO-PRO

| Endpoint | Description |
|---|---|
| `GET /api/users/organisations/` | Liste des organisations |
| `GET /api/diagnostics/by-org/<id>/` | Niveau de professionnalisation |

Base URL : `https://addj.impactlab-cilis.org/api`

---

## Structure du projet


impactlab-platform/
├── backend/ # Django + DRF
│ ├── apps/
│ │ ├── users/ # Authentification & rôles
│ │ ├── programmes/ # Programmes, étapes, cohortes
│ │ ├── beneficiaires/ # Bénéficiaires & structures
│ │ ├── inscriptions/ # Inscriptions & progressions
│ │ ├── suivi/ # Suivi insertion
│ │ ├── financements/ # Financements & bailleurs
│ │ ├── documents/ # Documents & fichiers
│ │ └── dashboard/ # Indicateurs & exports
│ └── config/ # settings.py, urls.py
└── frontend/ # React + Vite
└── src/
├── pages/ # Toutes les pages
├── services/ # api.js, authService.js
└── contexts/ # AuthContext




## Auteur

Développé dans le cadre d'un stage chez **Impact'Lab GDC** — Côte d'Ivoire (2026)


