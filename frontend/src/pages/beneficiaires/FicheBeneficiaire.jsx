import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function FicheBeneficiaire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beneficiaire, setBeneficiaire] = useState(null);
  const [historique, setHistorique] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  const charger = () => {
    setChargement(true);
    Promise.all([
      api.get(`beneficiaires/${id}/`),
      api.get(`beneficiaires/${id}/historique/`),
    ]).then(([res1, res2]) => {
      setBeneficiaire(res1.data);
      setHistorique(res2.data);
      setForm(res1.data);
    }).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [id]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    setSucces("");
    try {
      await api.put(`beneficiaires/${id}/`, form);
      setSucces("Fiche mise à jour avec succès.");
      setShowModal(false);
      charger();
    } catch {
      setErreur("Erreur lors de la mise à jour.");
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <div style={{ padding: "2rem", color: "#888" }}>Chargement...</div>;
  if (!beneficiaire) return <div style={{ padding: "2rem", color: "#888" }}>Bénéficiaire introuvable.</div>;

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/beneficiaires")}
            style={{ padding: "8px 14px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" }}
          >
            ← Retour
          </button>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>
              {beneficiaire.nom} {beneficiaire.prenom}
            </h1>
            <p style={{ fontSize: "13px", color: "#888" }}>Fiche bénéficiaire</p>
          </div>
        </div>
        <button
          onClick={() => { setShowModal(true); setErreur(""); setSucces(""); }}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          ✏️ Modifier
        </button>
      </div>

      {/* Message succès */}
      {succes && (
        <div style={{ background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
          ✅ {succes}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Informations personnelles */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Informations personnelles</h2>
          <InfoRow label="Nom complet" value={`${beneficiaire.nom} ${beneficiaire.prenom}`} />
          <InfoRow label="Genre" value={beneficiaire.genre_display} />
          <InfoRow label="Date de naissance" value={beneficiaire.date_naissance ? new Date(beneficiaire.date_naissance).toLocaleDateString("fr-FR") : "—"} />
          <InfoRow label="Nationalité" value={beneficiaire.nationalite || "—"} />
          <InfoRow label="Téléphone" value={beneficiaire.telephone} />
          <InfoRow label="Email" value={beneficiaire.email || "—"} />
          <InfoRow label="Localité" value={beneficiaire.localite || "—"} />
          <InfoRow label="Quartier" value={beneficiaire.quartier || "—"} />
        </div>

        {/* Situation professionnelle */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Situation professionnelle</h2>
          <InfoRow label="Niveau d'études" value={beneficiaire.niveau_etudes || "—"} />
          <InfoRow label="Statut pro" value={beneficiaire.statut_pro_display || "—"} />
          <InfoRow label="Expérience" value={beneficiaire.experience || "—"} />

          <h2 style={{ ...cardTitleStyle, marginTop: "1.5rem" }}>Contact d'urgence</h2>
          <InfoRow label="Nom" value={beneficiaire.contact_urgence_nom || "—"} />
          <InfoRow label="Téléphone" value={beneficiaire.contact_urgence_tel || "—"} />
        </div>

        {/* Historique des programmes */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <h2 style={cardTitleStyle}>Historique des programmes</h2>
          {historique?.inscriptions?.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>Aucun programme suivi.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Programme", "Cohorte", "Statut", "Date d'inscription"].map((col) => (
                    <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historique?.inscriptions?.map((ins, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px", fontSize: "13px", fontWeight: "500" }}>{ins.programme}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{ins.cohorte}</td>
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: ins.statut_inscription === "Validée" ? "#ECFDF5" : "#FEF9EC", color: ins.statut_inscription === "Validée" ? "#065F46" : "#92400E" }}>
                        {ins.statut_inscription}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                      {new Date(ins.date_inscription).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal modification */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Modifier la fiche</h2>
              <button
                onClick={() => setShowModal(false)}
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
                <Field label="Nom *" name="nom" value={form.nom || ""} onChange={handleFormChange} required />
                <Field label="Prénom *" name="prenom" value={form.prenom || ""} onChange={handleFormChange} required />
                <div>
                  <label style={labelStyle}>Genre *</label>
                  <select name="genre" value={form.genre || ""} onChange={handleFormChange} required style={inputStyle}>
                    <option value="">Sélectionner</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </div>
                <Field label="Date de naissance" name="date_naissance" type="date" value={form.date_naissance || ""} onChange={handleFormChange} />
                <Field label="Téléphone *" name="telephone" value={form.telephone || ""} onChange={handleFormChange} required />
                <Field label="Email" name="email" type="email" value={form.email || ""} onChange={handleFormChange} />
                <Field label="Nationalité" name="nationalite" value={form.nationalite || ""} onChange={handleFormChange} />
                <Field label="Localité" name="localite" value={form.localite || ""} onChange={handleFormChange} />
                <Field label="Quartier" name="quartier" value={form.quartier || ""} onChange={handleFormChange} />
                <Field label="Niveau d'études" name="niveau_etudes" value={form.niveau_etudes || ""} onChange={handleFormChange} />
                <div>
                  <label style={labelStyle}>Statut professionnel</label>
                  <select name="statut_pro" value={form.statut_pro || ""} onChange={handleFormChange} style={inputStyle}>
                    <option value="">Sélectionner</option>
                    <option value="etudiant">Étudiant</option>
                    <option value="demandeur_emploi">Demandeur d'emploi</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="salarie">Salarié</option>
                    <option value="sans_emploi">Sans emploi</option>
                  </select>
                </div>
                <Field label="Contact urgence (nom)" name="contact_urgence_nom" value={form.contact_urgence_nom || ""} onChange={handleFormChange} />
                <Field label="Contact urgence (tél)" name="contact_urgence_tel" value={form.contact_urgence_tel || ""} onChange={handleFormChange} />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 20px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  style={{ padding: "10px 20px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer", opacity: envoi ? 0.7 : 1 }}
                >
                  {envoi ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
      <span style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: "500" }}>{value}</span>
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

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "1.25rem",
  border: "1px solid #f0f0f0",
};

const cardTitleStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#1a1a1a",
  marginBottom: "1rem",
};

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