import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function DetailProgramme() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [programme, setProgramme] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  const charger = () => {
    setChargement(true);
    Promise.all([
      api.get(`programmes/${id}/`),
      api.get(`dashboard/programme/${id}/`),
    ]).then(([res1, res2]) => {
      setProgramme(res1.data);
      setDashboard(res2.data);
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
      await api.put(`programmes/${id}/`, form);
      setSucces("Programme mis à jour avec succès.");
      setShowModal(false);
      charger();
    } catch {
      setErreur("Erreur lors de la mise à jour.");
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <div style={{ padding: "2rem", color: "#888" }}>Chargement...</div>;
  if (!programme) return <div style={{ padding: "2rem", color: "#888" }}>Programme introuvable.</div>;

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/programmes")}
            style={{ padding: "8px 14px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" }}
          >
            ← Retour
          </button>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>{programme.nom}</h1>
            <p style={{ fontSize: "13px", color: "#888" }}>{programme.type_display}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", background: programme.statut === "actif" ? "#ECFDF5" : "#FEF2F2", color: programme.statut === "actif" ? "#065F46" : "#B91C1C" }}>
            {programme.statut_display}
          </span>
          <button
            onClick={() => { setShowModal(true); setErreur(""); setSucces(""); }}
            style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
          >
            ✏️ Modifier
          </button>
        </div>
      </div>

      {/* Message succès */}
      {succes && (
        <div style={{ background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
          ✅ {succes}
        </div>
      )}

      {/* Indicateurs */}
      {dashboard && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
          <MetricCard label="Inscrits" value={dashboard.total_inscrits} color="#1F4E5F" />
          <MetricCard label="Femmes" value={dashboard.femmes} color="#9D174D" />
          <MetricCard label="Taux de parité" value={`${dashboard.taux_parite}%`} color="#7F77DD" />
          <MetricCard label="Abandons" value={dashboard.abandons} color="#B91C1C" />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Informations générales */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Informations générales</h2>
          <InfoRow label="Nom" value={programme.nom} />
          <InfoRow label="Type" value={programme.type_display} />
          <InfoRow label="Statut" value={programme.statut_display} />
          <InfoRow label="Localité" value={programme.localite || "—"} />
          <InfoRow label="Date de début" value={new Date(programme.date_debut).toLocaleDateString("fr-FR")} />
          <InfoRow label="Date de fin" value={programme.date_fin ? new Date(programme.date_fin).toLocaleDateString("fr-FR") : "—"} />
          <InfoRow label="Description" value={programme.description || "—"} />
          <InfoRow label="Objectifs" value={programme.objectifs || "—"} />
        </div>

        {/* Étapes */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Étapes du programme ({programme.etapes?.length})</h2>
          {programme.etapes?.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune étape définie.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {programme.etapes?.map((etape) => (
                <div key={etape.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#f8f9fa", borderRadius: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1F4E5F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>
                    {etape.ordre}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{etape.nom}</div>
                    {etape.description && <div style={{ fontSize: "12px", color: "#888" }}>{etape.description}</div>}
                  </div>
                  {etape.validation_requise && (
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FEF9EC", color: "#92400E" }}>
                      Validation requise
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cohortes */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <h2 style={cardTitleStyle}>Cohortes ({programme.cohortes?.length})</h2>
          {programme.cohortes?.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune cohorte définie.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Nom", "Date de début", "Date de fin", "Capacité", "Inscrits"].map((col) => (
                    <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programme.cohortes?.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px", fontSize: "13px", fontWeight: "500" }}>{c.nom}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{new Date(c.date_debut).toLocaleDateString("fr-FR")}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{c.date_fin ? new Date(c.date_fin).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{c.capacite}</td>
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: "#f0f0f0", color: "#555" }}>
                        {c.nombre_inscrits} / {c.capacite}
                      </span>
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
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Modifier le programme</h2>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Field label="Nom du programme *" name="nom" value={form.nom || ""} onChange={handleFormChange} required />
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select name="type" value={form.type || ""} onChange={handleFormChange} required style={inputStyle}>
                    <option value="">Sélectionner</option>
                    <option value="insertion">Insertion / Emploi</option>
                    <option value="incubation">Incubation / Entrepreneuriat</option>
                    <option value="education">Éducation</option>
                    <option value="conseil">Conseil / Accompagnement</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Statut</label>
                  <select name="statut" value={form.statut || ""} onChange={handleFormChange} style={inputStyle}>
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Date de début *" name="date_debut" type="date" value={form.date_debut || ""} onChange={handleFormChange} required />
                  <Field label="Date de fin" name="date_fin" type="date" value={form.date_fin || ""} onChange={handleFormChange} />
                </div>
                <Field label="Localité" name="localite" value={form.localite || ""} onChange={handleFormChange} />
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" value={form.description || ""} onChange={handleFormChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div>
                  <label style={labelStyle}>Objectifs</label>
                  <textarea name="objectifs" value={form.objectifs || ""} onChange={handleFormChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
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

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: "24px", fontWeight: "700", color }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>{label}</div>
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
      <input type={type} name={name} value={value} onChange={onChange} required={required} style={inputStyle} />
    </div>
  );
}

const cardStyle = { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" };
const cardTitleStyle = { fontSize: "15px", fontWeight: "700", color: "#1a1a1a", marginBottom: "1rem" };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" };