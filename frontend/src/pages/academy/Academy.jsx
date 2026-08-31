import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Academy() {
  const [cours, setCours]           = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [coursSelectionne, setCoursSelectionne] = useState(null);

  const charger = () => {
    setChargement(true);
    api.get("beneficiaires/cours-academy/")
      .then((res) => setCours(res.data.cours || []))
      .catch(() => setErreur("Impossible de contacter Impact'Lab Academy."))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirInscrits = (cours) => {
    setCoursSelectionne(cours);
    setShowModal(true);
  };

  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Impact'Lab Academy</h1>
          <p style={s.sousTitre}>Catalogue des formations disponibles</p>
        </div>
        <button onClick={charger} style={s.btnPrimary}>
          🔄 Actualiser
        </button>
      </div>

      {/* ── ERREUR ── */}
      {erreur && <div style={s.alertError}>{erreur}</div>}

      {/* ── CONTENU ── */}
      {chargement ? (
        <div style={s.center}>Chargement des cours...</div>
      ) : cours.length === 0 ? (
        <div style={s.center}>Aucun cours disponible.</div>
      ) : (
        <div style={s.grid}>
          {cours.map((c) => (
            <div key={c.id} style={{ ...s.card, opacity: c.visible ? 1 : 0.6 }}>

              {/* En-tête carte */}
              <div style={s.cardHeader}>
                <span style={s.code}>{c.code}</span>
                {!c.visible && <span style={s.badgeInvisible}>Non publié</span>}
              </div>

              {/* Titre */}
              <div style={s.cardTitle}>{c.nom}</div>

              {/* Résumé */}
              {c.resume && (
                <div style={s.resume}>
                  {c.resume.replace(/<[^>]*>/g, "").substring(0, 120)}...
                </div>
              )}

              {/* Pied de carte */}
              <div style={s.cardFooter}>
                <span style={s.badgeCategorie}>
                  {c.categorie_id === 9 ? "ASSO-PRO" : c.categorie_id === 2 ? "IGBS" : "Autre"}
                </span>
                <button onClick={() => ouvrirInscrits(c)} style={s.btnInscrits}>
                  👥 {c.nb_inscrits} inscrit(s)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL INSCRITS ── */}
      {showModal && coursSelectionne && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div>
                <h2 style={s.modalTitre}>{coursSelectionne.nom}</h2>
                <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                  {coursSelectionne.nb_inscrits} inscrit(s)
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={s.btnClose}>✕</button>
            </div>

            {coursSelectionne.inscrits.length === 0 ? (
              <div style={s.center}>Aucun inscrit dans ce cours.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Nom complet", "Email", "Pays", "Dernière connexion", "Progression"].map((col) => (
                      <th key={col} style={s.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coursSelectionne.inscrits.map((inscrit) => (
                    <tr key={inscrit.id} style={s.tr}>
                      <td style={{ ...s.td, fontWeight: "500" }}>{inscrit.nom}</td>
                      <td style={s.td}>{inscrit.email}</td>
                      <td style={s.td}>{inscrit.pays || "—"}</td>
                      <td style={s.td}>
                        {inscrit.derniere_connexion
                          ? new Date(inscrit.derniere_connexion * 1000).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                          background: inscrit.progression === "✅ Terminé" ? "#ECFDF5" : "#FEF9EC",
                          color: inscrit.progression === "✅ Terminé" ? "#065F46" : "#92400E",
                        }}>
                          {inscrit.progression || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  header:         { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  titre:          { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre:      { fontSize: "13px", color: "#888", marginTop: "4px" },
  center:         { padding: "2rem", textAlign: "center", color: "#888" },
  grid:           { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" },
  card:           { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "10px" },
  cardHeader:     { display: "flex", justifyContent: "space-between", alignItems: "center" },
  code:           { fontSize: "11px", fontWeight: "600", color: "#0F6E56", background: "#ECFDF5", padding: "3px 8px", borderRadius: "20px" },
  cardTitle:      { fontSize: "14px", fontWeight: "700", color: "#1a1a1a", lineHeight: "1.4" },
  resume:         { fontSize: "12px", color: "#666", lineHeight: "1.5", flex: 1 },
  cardFooter:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  badgeCategorie: { fontSize: "11px", fontWeight: "600", color: "#042C53", background: "#EEF5F7", padding: "3px 8px", borderRadius: "20px" },
  badgeInvisible: { fontSize: "11px", fontWeight: "600", color: "#92400E", background: "#FEF9EC", padding: "3px 8px", borderRadius: "20px" },
  btnInscrits:    { fontSize: "12px", color: "#0F6E56", fontWeight: "600", background: "#ECFDF5", border: "none", padding: "4px 10px", borderRadius: "20px", cursor: "pointer" },
  alertError:     { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  btnPrimary:     { padding: "10px 18px", background: "#042C53", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  overlay:        { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:          { background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  modalTitre:     { fontSize: "18px", fontWeight: "700", margin: 0 },
  btnClose:       { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" },
  table:          { width: "100%", borderCollapse: "collapse" },
  th:             { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:             { borderBottom: "1px solid #f5f5f5" },
  td:             { padding: "12px", fontSize: "13px", color: "#444", verticalAlign: "middle" },
};