import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("dashboard/").then((res) => {
      setData(res.data);
    }).finally(() => setChargement(false));
  }, []);

  const handleExport = (format) => {
    const token = localStorage.getItem("access");
    fetch(`http://localhost:8000/api/dashboard/export/${format}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rapport_impact_impactlab.${format === "excel" ? "xlsx" : "pdf"}`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("Erreur lors de l'export."));
  };

  if (chargement) return <div style={styles.loading}>Chargement...</div>;
  if (!data) return <div style={styles.loading}>Erreur de chargement.</div>;

  const { beneficiaires, programmes, inscriptions, insertion, financements, repartition_localite } = data;

  return (
    <div>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.titre}>Tableau de bord</h1>
          <p style={styles.sousTitre}>Vue d'ensemble de l'impact d'Impact'Lab GDC</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => handleExport("excel")}
            style={styles.exportBtn("#0F6E56")}
          >
            📊 Export Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            style={styles.exportBtn("#1F4E5F")}
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div style={styles.metricsGrid}>
        <MetricCard label="Total bénéficiaires" value={beneficiaires.total} icon="👥" color="#1F4E5F" />
        <MetricCard label="Programmes actifs" value={programmes.actifs} icon="📋" color="#0F6E56" sub={`sur ${programmes.total} programmes`} />
        <MetricCard label="Taux d'insertion" value={`${insertion.taux_insertion}%`} icon="📈" color="#7F77DD" sub={`${insertion.total_inseres} bénéficiaires insérés`} />
        <MetricCard label="Financements réalisés" value={formatMontant(financements.total_realise)} icon="💰" color="#BA7517" sub={`Taux : ${financements.taux_execution}%`} />
      </div>

      {/* Ligne 2 */}
      <div style={styles.row2}>
        <div style={card}>
          <div style={styles.cardTitle}>Indicateur de parité</div>
          <div style={styles.pariteContainer}>
            <svg viewBox="0 0 120 120" width="110" height="110" style={{ flexShrink: 0 }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1D9E75" strokeWidth="12"
                strokeDasharray={`${(beneficiaires.taux_parite / 100) * 314} 314`}
                strokeLinecap="round" transform="rotate(-90 60 60)" />
              <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1a1a1a">{beneficiaires.taux_parite}%</text>
              <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#999">femmes</text>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={styles.pariteRow}><span style={styles.dot("#1D9E75")} />Femmes : {beneficiaires.femmes}</div>
              <div style={styles.pariteRow}><span style={styles.dot("#378ADD")} />Hommes : {beneficiaires.hommes}</div>
              <div style={{ marginTop: "12px", padding: "8px 12px", borderRadius: "8px", background: beneficiaires.parite_atteinte ? "#ECFDF5" : "#FEF9EC", color: beneficiaires.parite_atteinte ? "#065F46" : "#92400E", fontSize: "12px", fontWeight: "500" }}>
                {beneficiaires.parite_atteinte ? "✅ Objectif 43% atteint" : "⚠ Objectif 43% non atteint"}
              </div>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={styles.cardTitle}>Inscriptions</div>
          <StatRow label="Total inscriptions" value={inscriptions.total} />
          <StatRow label="Validées" value={inscriptions.validees} color="#065F46" bg="#ECFDF5" />
          <StatRow label="En attente" value={inscriptions.en_attente} color="#92400E" bg="#FEF9EC" />
          <StatRow label="Taux d'abandon" value={`${inscriptions.taux_abandon}%`} color="#B91C1C" bg="#FEF2F2" />
        </div>

        <div style={card}>
          <div style={styles.cardTitle}>Suivi insertion 3/6/12 mois</div>
          {insertion.par_statut.map((s) => (
            <StatRow key={s.statut_insertion} label={formatStatut(s.statut_insertion)} value={s.total} />
          ))}
        </div>
      </div>

      {/* Répartition géographique */}
      {repartition_localite.length > 0 && (
        <div style={{ ...card, marginTop: "1rem" }}>
          <div style={styles.cardTitle}>Répartition géographique</div>
          <div style={styles.localiteGrid}>
            {repartition_localite.slice(0, 6).map((loc) => (
              <div key={loc.localite} style={styles.localiteCard}>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{loc.localite || "Non renseigné"}</div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1F4E5F" }}>{loc.total}</div>
                <div style={{ fontSize: "11px", color: "#aaa" }}>bénéficiaires</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color, sub }) {
  return (
    <div style={{ ...card, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "28px", fontWeight: "700", color, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>{label}</div>
      {sub && <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}

function StatRow({ label, value, color = "#1a1a1a", bg = "#f8f9fa" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
      <span style={{ fontSize: "13px", color: "#555" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: "600", padding: "2px 10px", borderRadius: "20px", color, background: bg }}>{value}</span>
    </div>
  );
}

function formatMontant(montant) {
  if (!montant) return "0 FCFA";
  if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M FCFA`;
  if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K FCFA`;
  return `${montant} FCFA`;
}

function formatStatut(statut) {
  const map = {
    emploi_salarie: "Emploi salarié",
    entrepreneuriat: "Entrepreneuriat",
    formation: "Formation continue",
    sans_solution: "Sans solution",
    non_repondu: "Non répondu",
  };
  return map[statut] || statut;
}

const card = {
  background: "#fff",
  borderRadius: "12px",
  padding: "1.25rem",
  border: "1px solid #f0f0f0",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const styles = {
  loading: { padding: "2rem", color: "#888", textAlign: "center" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  titre: { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre: { fontSize: "13px", color: "#888", marginTop: "4px" },
  exportBtn: (bg) => ({ padding: "10px 18px", background: bg, color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }),
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" },
  row2: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" },
  cardTitle: { fontWeight: "600", fontSize: "14px", color: "#1a1a1a", marginBottom: "1rem" },
  pariteContainer: { display: "flex", alignItems: "center", gap: "1rem" },
  pariteRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555", marginBottom: "6px" },
  dot: (color) => ({ width: "10px", height: "10px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }),
  localiteGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  localiteCard: { background: "#f8f9fa", borderRadius: "8px", padding: "12px", textAlign: "center" },
};