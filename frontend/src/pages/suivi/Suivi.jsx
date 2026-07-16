import { useEffect, useState } from "react";
import api from "../../services/api";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FORM_VIDE = {
  beneficiaire: "",
  programme: "",
  jalon: "",
  statut_insertion: "",
  notes: "",
};

const STATUT_COLORS = {
  emploi_salarie:  { background: "#ECFDF5", color: "#065F46" },
  entrepreneuriat: { background: "#E6F1FB", color: "#042C53" },
  formation:       { background: "#FEF9EC", color: "#92400E" },
  sans_solution:   { background: "#FEF2F2", color: "#B91C1C" },
  non_repondu:     { background: "#f0f0f0", color: "#555" },
};

// ─── Composant principal ───────────────────────────────────────────────────────

export default function Suivi() {
  const [suivis, setSuivis]               = useState([]);
  const [parite, setParite]               = useState(null);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [programmes, setProgrammes]       = useState([]);
  const [chargement, setChargement]       = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [envoi, setEnvoi]                 = useState(false);
  const [erreur, setErreur]               = useState("");
  const [succes, setSucces]               = useState("");
  const [filtreJalon, setFiltreJalon]     = useState("");
  const [form, setForm]                   = useState(FORM_VIDE);

  // ── Chargement ──
  const charger = (jalon = filtreJalon) => {
    setChargement(true);
    const params = new URLSearchParams();
    if (jalon) params.append("jalon", jalon);
    Promise.all([
      api.get("suivi/?" + params.toString()),
      api.get("suivi/parite/"),
      api.get("beneficiaires/"),
      api.get("programmes/"),
    ]).then(([s, p, b, pr]) => {
      setSuivis(s.data);
      setParite(p.data);
      setBeneficiaires(b.data);
      setProgrammes(pr.data);
    }).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  // ── Filtre jalon ──
  const handleFiltreJalon = (e) => {
    const val = e.target.value;
    setFiltreJalon(val);
    charger(val);
  };

  // ── Formulaire ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    try {
      await api.post("suivi/", form);
      setSucces("Suivi enregistré avec succès.");
      setShowModal(false);
      setForm(FORM_VIDE);
      charger();
    } catch {
      setErreur("Erreur. Ce suivi existe peut-être déjà pour ce bénéficiaire et ce jalon.");
    } finally {
      setEnvoi(false);
    }
  };

  // ── Suppression ──
  const handleSupprimer = (sv) => {
    if (window.confirm(`Supprimer ce suivi de ${sv.beneficiaire_nom} ?`)) {
      api.delete(`suivi/${sv.id}/`).then(() => charger());
    }
  };

  // ── Rendu ──
  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Suivi Insertion</h1>
          <p style={s.sousTitre}>Suivi à 3, 6 et 12 mois après le programme</p>
        </div>
        <button onClick={() => { setShowModal(true); setErreur(""); setSucces(""); }} style={s.btnPrimary}>
          + Nouveau suivi
        </button>
      </div>

      {/* ── INDICATEUR DE PARITÉ ── */}
      {parite && (
        <div style={s.pariteGrid}>
          <div style={s.pariteCard}>
            <div style={s.pariteValue}>{parite.total_beneficiaires}</div>
            <div style={s.pariteLabel}>Total bénéficiaires</div>
          </div>
          <div style={s.pariteCard}>
            <div style={s.pariteValue}>{parite.nombre_femmes}</div>
            <div style={s.pariteLabel}>Femmes</div>
          </div>
          <div style={s.pariteCard}>
            <div style={{ ...s.pariteValue, color: parite.atteint ? "#065F46" : "#B91C1C" }}>
              {parite.taux_parite}%
            </div>
            <div style={s.pariteLabel}>Taux de parité</div>
          </div>
          <div style={s.pariteCard}>
            <div style={{ ...s.pariteValue, color: parite.atteint ? "#065F46" : "#B91C1C", fontSize: "16px" }}>
              {parite.atteint ? "✅ Atteint" : "⚠ Non atteint"}
            </div>
            <div style={s.pariteLabel}>Objectif 43%</div>
          </div>
        </div>
      )}

      {/* ── MESSAGE SUCCÈS ── */}
      {succes && <div style={s.alertSuccess}>✅ {succes}</div>}

      {/* ── FILTRE ── */}
      <div style={{ ...s.card, marginBottom: "1rem", display: "flex", gap: "12px", alignItems: "center" }}>
        <label style={s.label}>Filtrer par jalon :</label>
        <select value={filtreJalon} onChange={handleFiltreJalon} style={s.select}>
          <option value="">Tous les jalons</option>
          <option value="3_mois">3 mois</option>
          <option value="6_mois">6 mois</option>
          <option value="12_mois">12 mois</option>
        </select>
      </div>

      {/* ── TABLEAU ── */}
      <div style={s.card}>
        <div style={s.cardTitle}>{suivis.length} suivi(s)</div>

        {chargement ? (
          <div style={s.center}>Chargement...</div>
        ) : suivis.length === 0 ? (
          <div style={s.center}>Aucun suivi enregistré.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Bénéficiaire", "Programme", "Jalon", "Statut insertion", "Date", "Notes", "Actions"].map((col) => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suivis.map((sv) => (
                <tr key={sv.id} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: "500" }}>{sv.beneficiaire_nom}</td>
                  <td style={s.td}>{sv.programme_nom}</td>
                  <td style={s.td}>
                    <span style={s.badgeJalon}>{sv.jalon_display}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(STATUT_COLORS[sv.statut_insertion] || {}) }}>
                      {sv.statut_display}
                    </span>
                  </td>
                  <td style={s.td}>{new Date(sv.date_suivi).toLocaleDateString("fr-FR")}</td>
                  <td style={s.td}>{sv.notes || "—"}</td>
                  <td style={s.td}>
                    <button onClick={() => handleSupprimer(sv)} style={s.btnSupprimer}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL NOUVEAU SUIVI ── */}
      {showModal && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: "500px" }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitre}>Nouveau suivi d'insertion</h2>
              <button onClick={() => setShowModal(false)} style={s.btnClose}>✕</button>
            </div>

            {erreur && <div style={s.alertError}>{erreur}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>

                <div>
                  <label style={s.label}>Bénéficiaire *</label>
                  <select value={form.beneficiaire} onChange={(e) => setForm({ ...form, beneficiaire: e.target.value })} required style={s.input}>
                    <option value="">Sélectionner</option>
                    {beneficiaires.map((b) => <option key={b.id} value={b.id}>{b.nom_complet}</option>)}
                  </select>
                </div>

                <div>
                  <label style={s.label}>Programme *</label>
                  <select value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })} required style={s.input}>
                    <option value="">Sélectionner</option>
                    {programmes.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>

                <div>
                  <label style={s.label}>Jalon *</label>
                  <select value={form.jalon} onChange={(e) => setForm({ ...form, jalon: e.target.value })} required style={s.input}>
                    <option value="">Sélectionner</option>
                    <option value="3_mois">Suivi 3 mois</option>
                    <option value="6_mois">Suivi 6 mois</option>
                    <option value="12_mois">Suivi 12 mois</option>
                  </select>
                </div>

                <div>
                  <label style={s.label}>Statut d'insertion *</label>
                  <select value={form.statut_insertion} onChange={(e) => setForm({ ...form, statut_insertion: e.target.value })} required style={s.input}>
                    <option value="">Sélectionner</option>
                    <option value="emploi_salarie">Emploi salarié</option>
                    <option value="entrepreneuriat">Entrepreneuriat</option>
                    <option value="formation">Formation continue</option>
                    <option value="sans_solution">Sans solution</option>
                    <option value="non_repondu">Non répondu</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Observations, commentaires..."
                    style={{ ...s.input, resize: "vertical" }}
                  />
                </div>
              </div>

              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>Annuler</button>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  titre:       { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre:   { fontSize: "13px", color: "#888", marginTop: "4px" },
  card:        { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" },
  cardTitle:   { fontWeight: "600", fontSize: "14px", marginBottom: "1rem" },
  center:      { padding: "2rem", textAlign: "center", color: "#888" },
  pariteGrid:  { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" },
  pariteCard:  { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", textAlign: "center" },
  pariteValue: { fontSize: "24px", fontWeight: "700", color: "#1F4E5F", marginBottom: "4px" },
  pariteLabel: { fontSize: "12px", color: "#888" },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:          { borderBottom: "1px solid #f5f5f5" },
  td:          { padding: "12px", fontSize: "13px", color: "#444", verticalAlign: "middle" },
  badge:       { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  badgeJalon:  { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#EEF5F7", color: "#1F4E5F" },
  select:      { padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
  btnPrimary:   { padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSupprimer: { padding: "6px 12px", background: "#FEF2F2", color: "#B91C1C", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnClose:     { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" },
  alertSuccess: { background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
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