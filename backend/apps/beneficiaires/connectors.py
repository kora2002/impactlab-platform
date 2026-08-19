import requests
from .models import Structure

ASSO_PRO_BASE_URL = "https://addj.impactlab-cilis.org/api"
ASSO_PRO_USERNAME = "crm_service"
ASSO_PRO_PASSWORD = "fwTXAxfmpkqdUgtXtXrhm25GKkG2"

SAGEO_BASE_URL = "https://api-sageo.impactlab-cilis.org/api/v1"
SAGEO_EMAIL    = "crm-sageo@impactlab-cilis.org"
SAGEO_PASSWORD = "JjSaeSRhZuwpbzRWPCZqFRJMt5qp"


def get_token_asso_pro():
    """Obtenir un token JWT depuis ASSO-PRO"""
    try:
        response = requests.post(
            f"{ASSO_PRO_BASE_URL}/users/login/",
            json={"username": ASSO_PRO_USERNAME, "password": ASSO_PRO_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            return response.json().get("access")
        return None
    except Exception:
        return None


def get_cookies_sageo():
    """Obtenir les cookies de session depuis SAGEO/IGBS"""
    try:
        session = requests.Session()
        response = session.post(
            f"{SAGEO_BASE_URL}/auth/login",
            json={"email": SAGEO_EMAIL, "password": SAGEO_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            return session.cookies
        return None
    except Exception:
        return None


def importer_organisations_asso_pro():
    """
    Récupère toutes les organisations depuis ASSO-PRO
    avec leur niveau de professionnalisation (diagnostic)
    et les importe dans notre base comme Structure de type 'association'
    """
    try:
        # ── 1. Authentification ──
        token = get_token_asso_pro()
        if not token:
            return {"erreur": "Impossible de s'authentifier à ASSO-PRO.", "importees": 0}

        headers = {"Authorization": f"Bearer {token}"}

        # ── 2. Récupérer la liste des organisations ──
        response = requests.get(
            f"{ASSO_PRO_BASE_URL}/users/organisations/",
            headers=headers,
            timeout=10
        )
        if response.status_code != 200:
            return {"erreur": f"Erreur API ASSO-PRO : {response.status_code}", "importees": 0}

        organisations = response.json()
        importees = 0
        doublons  = 0
        erreurs   = []

        for org in organisations:
            try:
                org_id = org.get("id", "")
                nom    = org.get("nom", "")

                if Structure.objects.filter(nom=nom, type="association").exists():
                    doublons += 1
                    continue

                # ── 3. Récupérer le niveau de professionnalisation ──
                niveau_pro = ""
                try:
                    diag_response = requests.get(
                        f"{ASSO_PRO_BASE_URL}/diagnostics/by-org/{org_id}/",
                        headers=headers,
                        timeout=5
                    )
                    if diag_response.status_code == 200:
                        diag_data       = diag_response.json()
                        score_total     = diag_data.get("score_total", "")
                        niveau          = diag_data.get("niveau", "")
                        professionalism = diag_data.get("professionalism_level", "")
                        if score_total:
                            niveau_pro = f"Score : {score_total}/100 — {niveau} ({professionalism})"
                except Exception:
                    pass

                # ── 4. Créer la structure ──
                Structure.objects.create(
                    nom=nom,
                    type="association",
                    secteur=org.get("type_nom", ""),
                    contact_email=org.get("email", ""),
                    contact_tel=org.get("contact", ""),
                    contact_nom=org.get("ville", ""),
                    description=f"Importée depuis ASSO-PRO — ID: {org_id} — {org.get('pays', '')}",
                    niveau_professionnalisation=niveau_pro,
                    source="asso_pro",
                )
                importees += 1

            except Exception as e:
                erreurs.append(f"Erreur pour {org.get('nom', '?')} : {str(e)}")

        return {
            "importees": importees,
            "doublons":  doublons,
            "erreurs":   erreurs,
            "message":   f"{importees} organisation(s) importée(s) depuis ASSO-PRO."
        }

    except requests.exceptions.ConnectionError:
        return {"erreur": "Impossible de contacter l'API ASSO-PRO.", "importees": 0}
    except Exception as e:
        return {"erreur": str(e), "importees": 0}


def importer_entreprises_sageo():
    """
    Récupère les entreprises accompagnées depuis SAGEO
    et les importe dans notre base comme Structure de type 'entreprise'
    """
    try:
        # ── 1. Authentification ──
        cookies = get_cookies_sageo()
        if not cookies:
            return {"erreur": "Impossible de s'authentifier à SAGEO.", "importees": 0}

        # ── 2. Récupérer les entreprises SAGEO ──
        response = requests.get(
            f"{SAGEO_BASE_URL}/staff/entreprises",
            cookies=cookies,
            timeout=10
        )
        if response.status_code != 200:
            return {"erreur": f"Erreur API SAGEO : {response.status_code}", "importees": 0}

        data       = response.json()
        entreprises = data.get("entreprises", [])
        importees  = 0
        doublons   = 0
        erreurs    = []

        for entreprise in entreprises:
            try:
                nom = entreprise.get("nom", "")

                if Structure.objects.filter(nom=nom, type="entreprise").exists():
                    doublons += 1
                    continue

                Structure.objects.create(
                    nom=nom,
                    type="entreprise",
                    secteur=entreprise.get("secteur", ""),
                    contact_email=entreprise.get("email", ""),
                    contact_tel=entreprise.get("telephone", ""),
                    description=f"Importée depuis SAGEO — Statut : {entreprise.get('statut', '')}",
                    source="sageo",
                )
                importees += 1

            except Exception as e:
                erreurs.append(f"Erreur pour {entreprise.get('nom', '?')} : {str(e)}")

        return {
            "importees": importees,
            "doublons":  doublons,
            "erreurs":   erreurs,
            "message":   f"{importees} entreprise(s) importée(s) depuis SAGEO."
        }

    except requests.exceptions.ConnectionError:
        return {"erreur": "Impossible de contacter l'API SAGEO.", "importees": 0}
    except Exception as e:
        return {"erreur": str(e), "importees": 0}


def importer_porteurs_igbs():
    """
    Récupère les porteurs de projets IGBS depuis SAGEO
    et les importe dans notre base comme Bénéficiaires
    """
    from apps.beneficiaires.models import Beneficiaire
    try:
        # ── 1. Authentification ──
        cookies = get_cookies_sageo()
        if not cookies:
            return {"erreur": "Impossible de s'authentifier à SAGEO.", "importees": 0}

        # ── 2. Récupérer les porteurs IGBS ──
        response = requests.get(
            f"{SAGEO_BASE_URL}/staff/porteurs",
            cookies=cookies,
            timeout=10
        )
        if response.status_code != 200:
            return {"erreur": f"Erreur API IGBS : {response.status_code}", "importees": 0}

        data     = response.json()
        porteurs = data.get("porteurs", [])
        importees = 0
        doublons  = 0
        erreurs   = []

        for porteur in porteurs:
            try:
                email     = porteur.get("email", "")
                telephone = porteur.get("telephone", "") or "N/A"
                nom       = porteur.get("nom", "")
                prenom    = porteur.get("prenom", "")

                # Vérifie si le bénéficiaire existe déjà
                if (email and Beneficiaire.objects.filter(email=email).exists()) or \
                   Beneficiaire.objects.filter(telephone=telephone).exists():
                    doublons += 1
                    continue

                Beneficiaire.objects.create(
                    nom=nom,
                    prenom=prenom,
                    genre=porteur.get("genre", "homme"),
                    email=email,
                    telephone=telephone,
                    localite=porteur.get("ville", ""),
                    statut_pro="entrepreneur",
                )
                importees += 1

            except Exception as e:
                erreurs.append(f"Erreur pour {porteur.get('nom', '?')} : {str(e)}")

        return {
            "importees": importees,
            "doublons":  doublons,
            "erreurs":   erreurs,
            "message":   f"{importees} porteur(s) IGBS importé(s) comme bénéficiaires."
        }

    except requests.exceptions.ConnectionError:
        return {"erreur": "Impossible de contacter l'API IGBS.", "importees": 0}
    except Exception as e:
        return {"erreur": str(e), "importees": 0}