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


def importer_organisations_asso_pro():
    """
    Récupère toutes les organisations depuis ASSO-PRO
    et les importe dans notre base comme Structure de type 'association'
    """
    try:
        response = requests.get(
            f"{ASSO_PRO_BASE_URL}/users/organisations/",
            timeout=10
        )
        if response.status_code != 200:
            return {"erreur": f"Erreur API ASSO-PRO : {response.status_code}", "importees": 0}

        organisations = response.json()
        importees = 0
        doublons = 0
        erreurs = []

        for org in organisations:
            try:
                # Vérifie si la structure existe déjà
                existe = Structure.objects.filter(
                    nom=org.get("nom", ""),
                    type="association"
                ).exists()

                if existe:
                    doublons += 1
                    continue

                Structure.objects.create(
                    nom=org.get("nom", ""),
                    type="association",
                    secteur=org.get("type_nom", ""),
                    contact_email=org.get("email", ""),
                    description=f"Importée depuis ASSO-PRO — ID: {org.get('id', '')}",
                )
                importees += 1

            except Exception as e:
                erreurs.append(f"Erreur pour {org.get('nom', '?')} : {str(e)}")

        return {
            "importees": importees,
            "doublons": doublons,
            "erreurs": erreurs,
            "message": f"{importees} organisation(s) importée(s) depuis ASSO-PRO."
        }

    except requests.exceptions.ConnectionError:
        return {"erreur": "Impossible de contacter l'API ASSO-PRO.", "importees": 0}
    except Exception as e:
        return {"erreur": str(e), "importees": 0}