import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Academy() {
  const [cours, setCours]           = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState("");

  const charger = () => {
    setChargement(true);
    api.get("beneficiaires/cours-academy/")
      .then((res) => setCours(res.data.cours || []))
      .catch(() => setErreur("Impossible de contacter Impact'Lab Academy."))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

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
                  {c.resume.replace(/<[^>]*>/g, "").substring(0, 150)}...
                </div>
              )}

              {/* Pied de carte */}
              <div style={s.cardFooter}>
                <span style={s.badgeCategorie}>
                  {c.categorie_id === 9 ? "ASSO-PRO" : c.categorie_id === 2 ? "IGBS" : "Autre"}
                </span>
                
                 <a href={`https://academy.impactlab-cilis.org/course/view.php?id=${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={s.lien}
                >
                  Voir le cours
              </a>
              </div>
            </div>
          ))}
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
  lien:           { fontSize: "12px", color: "#0F6E56", fontWeight: "600", textDecoration: "none" },
  alertError:     { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  btnPrimary:     { padding: "10px 18px", background: "#042C53", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
};