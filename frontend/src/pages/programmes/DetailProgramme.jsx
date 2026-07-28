import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function DetailProgramme() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── États ──
  const [programme, setProgramme]       = useState(null);
  const [dashboard, setDashboard]       = useState(null);
  const [chargement, setChargement]     = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [showModalCohorte, setShowModalCohorte] = useState(false);
  const [form, setForm]                 = useState({});
  const [formCohorte, setFormCohorte]   = useState({ nom: "", date_debut: "", date_fin: "", capacite: "" });
  const [envoi, setEnvoi]               = useState(false);
  const [envoiCohorte, setEnvoiCohorte] = useState(false);
  const [erreur, setErreur]             = useState("");
  const [succes, setSucces]             = useState("");

  // ── Chargement ──
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

  // ── Modifier programme ──
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

  // ── Créer cohorte ──
  const handleSubmitCohorte = async (e) => {
    e.preventDefault();
    setEnvoiCohorte(true);
    try {
      await api.post(`programmes/${id}/cohortes/`, formCohorte);
      setSucces("Cohorte créée avec succès.");
      setShowModalCohorte(false);
      setFormCohorte({ nom: "", date_debut: "", date_fin: "", capacite: "" });
      charger();
    } catch {
      setErreur("Erreur lors de la création de la cohorte.");
    } finally {
      setEnvoiCohorte(false);
    }
  };

  if (chargement) return <div style={s.center}>Chargement...</div>;
  if (!programme) return <div style={s.center}>Programme introuvable.</div>;

  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate("/programmes")} style={s.btnSecondary}>
            ← Retour
          </button>
          <div>
            <h1 style={s.titre}>{programme.nom}</h1>
            <p style={s.sousTitre}>{programme.type_display}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{
            padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
            background: programme.statut === "actif" ? "#ECFDF5" : "#FEF2F2",
            color: programme.statut === "actif" ? "#065F46" : "#B91C1C"
          }}>
            {programme.statut_display}
          </span>
          <button onClick={() => { setShowModal(true); setErreur(""); setSucces(""); }} style={s.btnPrimary}>
            ✏️ Modifier
          </button>
        </div>
      </div>

      {/* ── MESSAGE SUCCÈS ── */}
      {succes && <div style={s.alertSuccess}>✅ {succes}</div>}

      {/* ── MÉTRIQUES ── */}
      {dashboard && (
        <div style={s.metricsGrid}>
          <MetricCard icon="👥" label="Bénéficiaires inscrits" value={dashboard.total_inscrits} color="#1F4E5F" />
          <MetricCard icon="👩" label="Femmes" value={dashboard.femmes} color="#9D174D"
            sub={`Taux de parité : ${dashboard.taux_parite}%`}
            alert={dashboard.taux_parite < 43 ? "⚠ Objectif 43% non atteint" : "✅ Objectif 43% atteint"}
            alertColor={dashboard.taux_parite < 43 ? "#92400E" : "#065F46"}
            alertBg={dashboard.taux_parite < 43 ? "#FEF9EC" : "#ECFDF5"}
          />
          <MetricCard icon="📋" label="Étapes du programme" value={dashboard.nombre_etapes} color="#7F77DD" />
          <MetricCard icon="⚠" label="Abandons" value={dashboard.abandons} color="#B91C1C" />
        </div>
      )}

      {/* ── GRILLE INFOS + ÉTAPES ── */}
      <div style={s.grid2}>

        {/* Informations générales */}
        <div style={s.card}>
          <div style={s.cardTitle}>📌 Informations générales</div>
          <InfoRow label="Nom"           value={programme.nom} />
          <InfoRow label="Type"          value={programme.type_display} />
          <InfoRow label="Statut"        value={programme.statut_display} />
          <InfoRow label="Localité"      value={programme.localite || "—"} />
          <InfoRow label="Date de début" value={new Date(programme.date_debut).toLocaleDateString("fr-FR")} />
          <InfoRow label="Date de fin"   value={programme.date_fin ? new Date(programme.date_fin).toLocaleDateString("fr-FR") : "—"} />
          <InfoRow label="Description"   value={programme.description || "—"} />
          <InfoRow label="Objectifs"     value={programme.objectifs || "—"} />
        </div>

        {/* Étapes */}
        <div style={s.card}>
          <div style={s.cardTitle}>🪜 Étapes du programme ({programme.etapes?.length})</div>
          {programme.etapes?.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune étape définie.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {programme.etapes?.map((etape) => (
                <div key={etape.id} style={s.etapeItem}>
                  <div style={s.etapeNumero}>{etape.ordre}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{etape.nom}</div>
                    {etape.description && <div style={{ fontSize: "12px", color: "#888" }}>{etape.description}</div>}
                  </div>
                  {etape.validation_requise && (
                    <span style={s.badgeValidation}>Validation requise</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cohortes */}
        <div style={{ ...s.card, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={s.cardTitle}>👥 Cohortes ({programme.cohortes?.length})</div>
            <button
              onClick={() => setShowModalCohorte(true)}
              style={{ padding: "6px 14px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer" }}
            >
              + Ajouter une cohorte
            </button>
          </div>

          {programme.cohortes?.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune cohorte définie.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Nom", "Date de début", "Date de fin", "Capacité", "Inscrits"].map((col) => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programme.cohortes?.map((c) => (
                  <tr key={c.id} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: "500" }}>{c.nom}</td>
                    <td style={s.td}>{new Date(c.date_debut).toLocaleDateString("fr-FR")}</td>
                    <td style={s.td}>{c.date_fin ? new Date(c.date_fin).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={s.td}>{c.capacite}</td>
                    <td style={s.td}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
                        background: c.nombre_inscrits >= c.capacite ? "#FEF2F2" : "#ECFDF5",
                        color: c.nombre_inscrits >= c.capacite ? "#B91C1C" : "#065F46",
                        fontWeight: "600"
                      }}>
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

      {/* ── MODAL MODIFICATION PROGRAMME ── */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitre}>Modifier le programme</h2>
              <button onClick={() => setShowModal(false)} style={s.btnClose}>✕</button>
            </div>

            {erreur && <div style={s.alertError}>{erreur}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Field label="Nom du programme *" name="nom" value={form.nom || ""} onChange={handleFormChange} required />
                <div>
                  <label style={s.label}>Type *</label>
                  <select name="type" value={form.type || ""} onChange={handleFormChange} required style={s.input}>
                    <option value="">Sélectionner</option>
                    <option value="insertion">Insertion / Emploi</option>
                    <option value="incubation">Incubation / Entrepreneuriat</option>
                    <option value="education">Éducation</option>
                    <option value="conseil">Conseil / Accompagnement</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Statut</label>
                  <select name="statut" value={form.statut || ""} onChange={handleFormChange} style={s.input}>
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Date de début *" name="date_debut" type="date" value={form.date_debut || ""} onChange={handleFormChange} required />
                  <Field label="Date de fin"     name="date_fin"   type="date" value={form.date_fin || ""}   onChange={handleFormChange} />
                </div>
                <Field label="Localité" name="localite" value={form.localite || ""} onChange={handleFormChange} />
                <div>
                  <label style={s.label}>Description</label>
                  <textarea name="description" value={form.description || ""} onChange={handleFormChange} rows={3} style={{ ...s.input, resize: "vertical" }} />
                </div>
                <div>
                  <label style={s.label}>Objectifs</label>
                  <textarea name="objectifs" value={form.objectifs || ""} onChange={handleFormChange} rows={3} style={{ ...s.input, resize: "vertical" }} />
                </div>
              </div>
              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ ...s.btnPrimary, opacity: envoi ? 0.7 : 1 }}>
                  {envoi ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CRÉATION COHORTE ── */}
      {showModalCohorte && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: "480px" }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitre}>Nouvelle cohorte</h2>
              <button onClick={() => setShowModalCohorte(false)} style={s.btnClose}>✕</button>
            </div>

            <form onSubmit={handleSubmitCohorte}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Field label="Nom de la cohorte *" name="nom" value={formCohorte.nom} onChange={(e) => setFormCohorte({ ...formCohorte, nom: e.target.value })} required />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Date de début *" name="date_debut" type="date" value={formCohorte.date_debut} onChange={(e) => setFormCohorte({ ...formCohorte, date_debut: e.target.value })} required />
                  <Field label="Date de fin"     name="date_fin"   type="date" value={formCohorte.date_fin}   onChange={(e) => setFormCohorte({ ...formCohorte, date_fin: e.target.value })} />
                </div>
                <Field label="Capacité *" name="capacite" type="number" value={formCohorte.capacite} onChange={(e) => setFormCohorte({ ...formCohorte, capacite: e.target.value })} required />
              </div>
              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowModalCohorte(false)} style={s.btnSecondary}>Annuler</button>
                <button type="submit" disabled={envoiCohorte} style={{ ...s.btnPrimary, opacity: envoiCohorte ? 0.7 : 1 }}>
                  {envoiCohorte ? "Création..." : "Créer la cohorte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, color, sub, alert, alertColor, alertBg }) {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "28px", fontWeight: "700", color, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>{label}</div>
      {sub && <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>{sub}</div>}
      {alert && (
        <div style={{ marginTop: "8px", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: alertBg, color: alertColor, display: "inline-block" }}>
          {alert}
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
      <label style={s.label}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} style={s.input} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  center:          { padding: "2rem", color: "#888", textAlign: "center" },
  header:          { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  titre:           { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre:       { fontSize: "13px", color: "#888" },
  metricsGrid:     { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" },
  grid2:           { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  card:            { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" },
  cardTitle:       { fontSize: "15px", fontWeight: "700", color: "#1a1a1a" },
  etapeItem:       { display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#f8f9fa", borderRadius: "8px" },
  etapeNumero:     { width: "28px", height: "28px", borderRadius: "50%", background: "#1F4E5F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 },
  badgeValidation: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#FEF9EC", color: "#92400E" },
  table:           { width: "100%", borderCollapse: "collapse" },
  th:              { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:              { borderBottom: "1px solid #f5f5f5" },
  td:              { padding: "12px", fontSize: "13px", color: "#444", verticalAlign: "middle" },
  btnPrimary:      { padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary:    { padding: "8px 14px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" },
  btnClose:        { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" },
  alertSuccess:    { background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  alertError:      { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  overlay:         { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:           { background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  modalTitre:      { fontSize: "18px", fontWeight: "700" },
  modalFooter:     { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" },
  label:           { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" },
  input:           { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
};