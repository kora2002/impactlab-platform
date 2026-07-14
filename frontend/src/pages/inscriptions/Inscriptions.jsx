import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Inscriptions() {
  const [inscriptions, setInscriptions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState("");

  const charger = () => {
    setChargement(true);
    const params = new URLSearchParams();
    if (filtreStatut) params.append("statut", filtreStatut);
    api.get(`inscriptions/?${params.toString()}`)
      .then((res) => setInscriptions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const statutColors = {
    en_attente: { background: "#FEF9EC", color: "#92400E" },
    validee:    { background: "#ECFDF5", color: "#065F46" },
    rejetee:    { background: "#FEF2F2", color: "#B91C1C" },
  };

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Inscriptions</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Suivi des inscriptions aux programmes</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", border: "1px solid #f0f0f0", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <select
          style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" }}
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="validee">Validée</option>
          <option value="rejetee">Rejetée</option>
        </select>
        <button
          onClick={charger}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          Filtrer
        </button>
        <button
          onClick={() => { setFiltreStatut(""); setTimeout(charger, 100); }}
          style={{ padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          Réinitialiser
        </button>
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "1rem" }}>
          {inscriptions.length} inscription(s)
        </div>

        {chargement ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Chargement...</div>
        ) : inscriptions.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Aucune inscription trouvée.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Bénéficiaire", "Programme", "Cohorte", "Date", "Statut", "Étape en cours", "Actions"].map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inscriptions.map((ins) => {
                const etapeEnCours = ins.progressions?.find(p => p.statut === "en_cours");
                return (
                  <tr key={ins.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px", fontSize: "13px", fontWeight: "500", color: "#1a1a1a" }}>
                      {ins.beneficiaire_nom}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                      {ins.programme_nom}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                      {ins.cohorte_nom}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                      {new Date(ins.date_inscription).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", ...(statutColors[ins.statut] || {}) }}>
                        {ins.statut_display}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                      {etapeEnCours ? etapeEnCours.etape_nom : "—"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => alert(`Détail inscription #${ins.id}`)}
                        style={{ padding: "6px 12px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}
                      >
                        Voir
                      </button>
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