import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FORM_VIDE = {
  nom: "", prenom: "", genre: "", date_naissance: "",
  nationalite: "", telephone: "", email: "", localite: "",
  quartier: "", niveau_etudes: "", statut_pro: "",
  contact_urgence_nom: "", contact_urgence_tel: "",
};

// ─── Composant principal ───────────────────────────────────────────────────────

export default function Beneficiaires() {
  const navigate = useNavigate();

  const [beneficiaires, setBeneficiaires] = useState([]);
  const [chargement, setChargement]       = useState(true);
  const [recherche, setRecherche]         = useState("");
  const [filtreGenre, setFiltreGenre]     = useState("");
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState(FORM_VIDE);
  const [envoi, setEnvoi]                 = useState(false);
  const [erreur, setErreur]               = useState("");

  // ── Chargement des bénéficiaires avec filtres ──
  const charger = (rech = recherche, genre = filtreGenre) => {
    setChargement(true);
    const params = new URLSearchParams();
    if (rech)  params.append("recherche", rech);
    if (genre) params.append("genre", genre);
    api.get(`beneficiaires/?${params.toString()}`)
      .then((res) => setBeneficiaires(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  // ── Gestion des filtres ──
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

  // ── Gestion du formulaire ──
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
      setForm(FORM_VIDE);
      charger();
    } catch {
      setErreur("Erreur lors de la création. Vérifiez les champs obligatoires.");
    } finally {
      setEnvoi(false);
    }
  };

  // ── Suppression d'un bénéficiaire ──
  const handleSupprimer = (b) => {
    if (window.confirm(`Supprimer ${b.nom_complet} ? Cette action est irréversible.`)) {
      api.delete(`beneficiaires/${b.id}/`).then(() => charger());
    }
  };

  // ── Rendu ──
  return (
    <div>

      {/* En-tête */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Bénéficiaires</h1>
          <p style={s.sousTitre}>Gestion des fiches bénéficiaires</p>
        </div>
        <button onClick={() => setShowModal(true)} style={s.btnPrimary}>
          + Nouveau bénéficiaire
        </button>
      </div>

      {/* Filtres */}
      <div style={s.card}>
        <form onSubmit={handleRecherche} style={s.filtresRow}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Rechercher par nom, téléphone, localité..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <select style={s.select} value={filtreGenre} onChange={handleGenreChange}>
            <option value="">Tous les genres</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>
          <button type="submit" style={s.btnPrimary}>Rechercher</button>
          <button type="button" onClick={handleReinitialiser} style={s.btnSecondary}>Réinitialiser</button>
        </form>
      </div>

      {/* Tableau */}
      <div style={{ ...s.card, marginTop: "1rem" }}>
        <div style={s.cardTitle}>{beneficiaires.length} bénéficiaire(s)</div>

        {chargement ? (
          <div style={s.center}>Chargement...</div>
        ) : beneficiaires.length === 0 ? (
          <div style={s.center}>Aucun bénéficiaire trouvé.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Nom complet", "Genre", "Téléphone", "Localité", "Statut pro", "Programmes", "Actions"].map((col) => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {beneficiaires.map((b) => (
                <tr key={b.id} style={s.tr}>

                  {/* Nom avec avatar */}
                  <td style={s.td}>
                    <div style={s.nomCell}>
                      <div style={s.avatar}>{b.nom_complet?.charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight: "500" }}>{b.nom_complet}</span>
                    </div>
                  </td>

                  {/* Genre */}
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: b.genre === "femme" ? "#FDF2F8" : "#EFF6FF",
                      color:      b.genre === "femme" ? "#9D174D"  : "#1E40AF",
                    }}>
                      {b.genre_display}
                    </span>
                  </td>

                  {/* Autres colonnes */}
                  <td style={s.td}>{b.telephone}</td>
                  <td style={s.td}>{b.localite || "—"}</td>
                  <td style={s.td}>{b.statut_pro || "—"}</td>
                  <td style={s.td}>
                    <span style={s.badgeGris}>{b.nombre_programmes} programme(s)</span>
                  </td>

                  {/* Actions */}
                  <td style={s.td}>
                    <div style={s.actionsCell}>
                      <button
                        onClick={() => navigate(`/beneficiaires/${b.id}`)}
                        style={s.btnVoir}
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleSupprimer(b)}
                        style={s.btnSupprimer}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal ajout bénéficiaire */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>

            {/* En-tête modal */}
            <div style={s.modalHeader}>
              <h2 style={s.modalTitre}>Nouveau bénéficiaire</h2>
              <button
                onClick={() => { setShowModal(false); setErreur(""); setForm(FORM_VIDE); }}
                style={s.btnClose}
              >
                ✕
              </button>
            </div>

            {/* Erreur */}
            {erreur && <div style={s.alertError}>{erreur}</div>}

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>
                <Field label="Nom *"     name="nom"    value={form.nom}    onChange={handleFormChange} required />
                <Field label="Prénom *"  name="prenom" value={form.prenom} onChange={handleFormChange} required />

                <div>
                  <label style={s.label}>Genre *</label>
                  <select name="genre" value={form.genre} onChange={handleFormChange} required style={s.input}>
                    <option value="">Sélectionner</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </div>

                <Field label="Date de naissance" name="date_naissance" type="date" value={form.date_naissance} onChange={handleFormChange} />
                <Field label="Téléphone *"        name="telephone"      value={form.telephone}      onChange={handleFormChange} required />
                <Field label="Email"              name="email"          type="email" value={form.email} onChange={handleFormChange} />
                <Field label="Nationalité"        name="nationalite"    value={form.nationalite}    onChange={handleFormChange} />
                <Field label="Localité"           name="localite"       value={form.localite}       onChange={handleFormChange} />
                <Field label="Quartier"           name="quartier"       value={form.quartier}       onChange={handleFormChange} />
                <Field label="Niveau d'études"    name="niveau_etudes"  value={form.niveau_etudes}  onChange={handleFormChange} />

                <div>
                  <label style={s.label}>Statut professionnel</label>
                  <select name="statut_pro" value={form.statut_pro} onChange={handleFormChange} style={s.input}>
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

              {/* Boutons */}
              <div style={s.modalFooter}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErreur(""); setForm(FORM_VIDE); }}
                  style={s.btnSecondary}
                >
                  Annuler
                </button>
                <button type="submit" disabled={envoi} style={{ ...s.btnPrimary, opacity: envoi ? 0.7 : 1 }}>
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

// ─── Sous-composant Field ──────────────────────────────────────────────────────

function Field({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={s.input}
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  titre:       { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre:   { fontSize: "13px", color: "#888", marginTop: "4px" },
  card:        { background: "#fff", borderRadius: "12px", padding: "1rem", border: "1px solid #f0f0f0" },
  cardTitle:   { fontWeight: "600", fontSize: "14px", marginBottom: "1rem" },
  center:      { padding: "2rem", textAlign: "center", color: "#888" },
  filtresRow:  { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px" },
  select:      { padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px" },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:          { borderBottom: "1px solid #f5f5f5" },
  td:          { padding: "12px", fontSize: "13px", color: "#444", verticalAlign: "middle" },
  nomCell:     { display: "flex", alignItems: "center", gap: "10px" },
  avatar:      { width: "32px", height: "32px", borderRadius: "50%", background: "#EEF5F7", color: "#1F4E5F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0 },
  badge:       { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  badgeGris:   { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: "#f0f0f0", color: "#555" },
  actionsCell: { display: "flex", gap: "8px" },
  btnPrimary:   { padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnVoir:      { padding: "6px 12px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnSupprimer: { padding: "6px 12px", background: "#FEF2F2", color: "#B91C1C", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnClose:     { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" },
  alertError:   { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:        { background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  modalTitre:   { fontSize: "18px", fontWeight: "700" },
  modalFooter:  { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" },
  formGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  label:        { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" },
  input:        { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
};