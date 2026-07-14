import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const formVide = {
  nom: "",
  prenom: "",
  genre: "",
  date_naissance: "",
  nationalite: "",
  telephone: "",
  email: "",
  localite: "",
  quartier: "",
  niveau_etudes: "",
  statut_pro: "",
  contact_urgence_nom: "",
  contact_urgence_tel: "",
};

export default function Beneficiaires() {
  const navigate = useNavigate();
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreGenre, setFiltreGenre] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(formVide);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = (rech = recherche, genre = filtreGenre) => {
    setChargement(true);
    const params = new URLSearchParams();
    if (rech) params.append("recherche", rech);
    if (genre) params.append("genre", genre);
    api.get(`beneficiaires/?${params.toString()}`)
      .then((res) => setBeneficiaires(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const handleGenreChange = (e) => {
    const val = e.target.value;
    setFiltreGenre(val);
    charger(recherche, val);
  };

  const handleRecherche = (e) => {
    e.preventDefault();
    charger(recherche, filtreGenre);
  };

  const handleReinitialiser = () => {
    setRecherche("");
    setFiltreGenre("");
    charger("", "");
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    try {
      await api.post("beneficiaires/", form);
      setShowModal(false);
      setForm(formVide);
      charger();
    } catch {
      setErreur("Erreur lors de la création. Vérifiez les champs obligatoires.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Bénéficiaires</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Gestion des fiches bénéficiaires</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          + Nouveau bénéficiaire
        </button>
      </div>

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", border: "1px solid #f0f0f0" }}>
        <form onSubmit={handleRecherche} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{ flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px" }}
            type="text"
            placeholder="Rechercher par nom, téléphone, localité..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <select
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px" }}
            value={filtreGenre}
            onChange={handleGenreChange}
          >
            <option value="">Tous les genres</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>
          <button
            type="submit"
            style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
          >
            Rechercher
          </button>
          <button
            type="button"
            onClick={handleReinitialiser}
            style={{ padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
          >
            Réinitialiser
          </button>
        </form>
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "1rem" }}>
          {beneficiaires.length} bénéficiaire(s)
        </div>
        {chargement ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Chargement...</div>
        ) : beneficiaires.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Aucun bénéficiaire trouvé.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nom complet", "Genre", "Téléphone", "Localité", "Statut pro", "Programmes", "Actions"].map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {beneficiaires.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px", fontSize: "13px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEF5F7", color: "#1F4E5F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px" }}>
                        {b.nom_complet?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: "500" }}>{b.nom_complet}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", background: b.genre === "femme" ? "#FDF2F8" : "#EFF6FF", color: b.genre === "femme" ? "#9D174D" : "#1E40AF" }}>
                      {b.genre_display}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.telephone}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.localite || "—"}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.statut_pro || "—"}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: "#f0f0f0", color: "#555" }}>
                      {b.nombre_programmes} programme(s)
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => navigate(`/beneficiaires/${b.id}`)}
                      style={{ padding: "6px 12px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal ajout bénéficiaire */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Nouveau bénéficiaire</h2>
              <button
                onClick={() => { setShowModal(false); setErreur(""); setForm(formVide); }}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            </div>

            {erreur && (
              <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Nom *" name="nom" value={form.nom} onChange={handleFormChange} required />
                <Field label="Prénom *" name="prenom" value={form.prenom} onChange={handleFormChange} required />
                <div>
                  <label style={labelStyle}>Genre *</label>
                  <select name="genre" value={form.genre} onChange={handleFormChange} required style={inputStyle}>
                    <option value="">Sélectionner</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </div>
                <Field label="Date de naissance" name="date_naissance" type="date" value={form.date_naissance} onChange={handleFormChange} />
                <Field label="Téléphone *" name="telephone" value={form.telephone} onChange={handleFormChange} required />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleFormChange} />
                <Field label="Nationalité" name="nationalite" value={form.nationalite} onChange={handleFormChange} />
                <Field label="Localité" name="localite" value={form.localite} onChange={handleFormChange} />
                <Field label="Quartier" name="quartier" value={form.quartier} onChange={handleFormChange} />
                <Field label="Niveau d'études" name="niveau_etudes" value={form.niveau_etudes} onChange={handleFormChange} />
                <div>
                  <label style={labelStyle}>Statut professionnel</label>
                  <select name="statut_pro" value={form.statut_pro} onChange={handleFormChange} style={inputStyle}>
                    <option value="">Sélectionner</option>
                    <option value="etudiant">Étudiant</option>
                    <option value="demandeur_emploi">Demandeur d'emploi</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="salarie">Salarié</option>
                    <option value="sans_emploi">Sans emploi</option>
                  </select>
                </div>
                <Field label="Contact urgence (nom)" name="contact_urgence_nom" value={form.contact_urgence_nom} onChange={handleFormChange} />
                <Field label="Contact urgence (tél)" name="contact_urgence_tel" value={form.contact_urgence_tel} onChange={handleFormChange} />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErreur(""); setForm(formVide); }}
                  style={{ padding: "10px 20px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  style={{ padding: "10px 20px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer", opacity: envoi ? 0.7 : 1 }}
                >
                  {envoi ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "500",
  color: "#444",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1.5px solid #e0e0e0",
  fontSize: "14px",
  background: "#fafafa",
};