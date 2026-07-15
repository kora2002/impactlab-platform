import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUT_COLORS = {
  en_attente: { background: "#FEF9EC", color: "#92400E" },
  validee:    { background: "#ECFDF5", color: "#065F46" },
  rejetee:    { background: "#FEF2F2", color: "#B91C1C" },
};

// ─── Composant principal ───────────────────────────────────────────────────────

export default function Inscriptions() {
  const navigate = useNavigate(); 
  const [inscriptions, setInscriptions] = useState([]);
  const [chargement, setChargement]     = useState(true);
  const [filtreStatut, setFiltreStatut] = useState("");

  // ── Chargement des inscriptions ──
  const charger = (statut = filtreStatut) => {
    setChargement(true);
    const params = new URLSearchParams();
    if (statut) params.append("statut", statut);
    api.get(`inscriptions/?${params.toString()}`)
      .then((res) => setInscriptions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  // ── Filtre par statut ──
  const handleFiltreStatut = (e) => {
    const val = e.target.value;
    setFiltreStatut(val);
    charger(val);
  };

  const handleReinitialiser = () => {
    setFiltreStatut("");
    charger("");
  };

  // ── Suppression d'une inscription ──
  const handleSupprimer = (ins) => {
    if (window.confirm(`Supprimer l'inscription de ${ins.beneficiaire_nom} dans ${ins.programme_nom} ?`)) {
      api.delete(`inscriptions/${ins.id}/`).then(() => charger());
    }
  };

  // ── Rendu ──
  return (
    <div>

      {/* En-tête */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Inscriptions</h1>
          <p style={s.sousTitre}>Suivi des inscriptions aux programmes</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={s.card}>
        <div style={s.filtresRow}>
          <select
            style={s.select}
            value={filtreStatut}
            onChange={handleFiltreStatut}
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="validee">Validée</option>
            <option value="rejetee">Rejetée</option>
          </select>
          <button onClick={() => charger(filtreStatut)} style={s.btnPrimary}>
            Filtrer
          </button>
          <button onClick={handleReinitialiser} style={s.btnSecondary}>
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ ...s.card, marginTop: "1rem" }}>
        <div style={s.cardTitle}>{inscriptions.length} inscription(s)</div>

        {chargement ? (
          <div style={s.center}>Chargement...</div>
        ) : inscriptions.length === 0 ? (
          <div style={s.center}>Aucune inscription trouvée.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Bénéficiaire", "Programme", "Cohorte", "Date", "Statut", "Étape en cours", "Actions"].map((col) => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inscriptions.map((ins) => {
                const etapeEnCours = ins.progressions?.find((p) => p.statut === "en_cours");
                return (
                  <tr key={ins.id} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: "500", color: "#1a1a1a" }}>{ins.beneficiaire_nom}</td>
                    <td style={s.td}>{ins.programme_nom}</td>
                    <td style={s.td}>{ins.cohorte_nom}</td>
                    <td style={s.td}>{new Date(ins.date_inscription).toLocaleDateString("fr-FR")}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...(STATUT_COLORS[ins.statut] || {}) }}>
                        {ins.statut_display}
                      </span>
                    </td>
                    <td style={s.td}>{etapeEnCours ? etapeEnCours.etape_nom : "—"}</td>
                    <td style={s.td}>
                      <div style={s.actionsCell}>
            
                        <button
                          onClick={() => navigate(`/inscriptions/${ins.id}`)}
                          style={s.btnVoir}
                          >
                            Voir
                        </button>
                        <button
                          onClick={() => handleSupprimer(ins)}
                          style={s.btnSupprimer}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
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
  select:      { padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:          { borderBottom: "1px solid #f5f5f5" },
  td:          { padding: "12px", fontSize: "13px", color: "#444", verticalAlign: "middle" },
  badge:       { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  actionsCell: { display: "flex", gap: "8px" },
  btnPrimary:   { padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnVoir:      { padding: "6px 12px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnSupprimer: { padding: "6px 12px", background: "#FEF2F2", color: "#B91C1C", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" },
};