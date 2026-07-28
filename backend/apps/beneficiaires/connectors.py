import requests
from .models import Structure

ASSO_PRO_BASE_URL = "https://addj.impactlab-cilis.org/api"


def get_token_asso_pro(username, password):
    """
    Obtenir un token JWT depuis ASSO-PRO
    """
    response = requests.post(
        f"{ASSO_PRO_BASE_URL}/users/login/",
        json={"username": username, "password": password},
        timeout=10
    )
    if response.status_code == 200:
        return response.json().get("access")
    return None


def importer_organisations_asso_pro(username=None, password=None):
    """
    Récupère toutes les organisations depuis ASSO-PRO
    Nécessite maintenant une authentification JWT
    """
    try:
        # ── 1. Obtenir le token ──
        token = None
        if username and password:
            token = get_token_asso_pro(username, password)
            if not token:
                return {"erreur": "Identifiants ASSO-PRO incorrects.", "importees": 0}

        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

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
                    contact_nom=f"{org.get('ville', '')} — {org.get('pays', '')}".strip(" —"),
                    description=f"Importée depuis ASSO-PRO — ID: {org_id}",
                    niveau_professionnalisation=niveau_pro,
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