import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Programmes() {
  const [programmes, setProgrammes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("programmes/")
      .then((res) => setProgrammes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  }, []);

  const typeColors = {
    incubation: { background: "#EEEDFE", color: "#26215C" },
    insertion:  { background: "#E1F5EE", color: "#04342C" },
    education:  { background: "#E6F1FB", color: "#042C53" },
    conseil:    { background: "#FAEEDA", color: "#412402" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Programmes</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Gestion des programmes Impact'Lab GDC</p>
        </div>
        <button
          onClick={() => alert("Formulaire à venir")}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          + Nouveau programme
        </button>
      </div>

      {chargement ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Chargement...</div>
      ) : programmes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>Aucun programme trouvé.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {programmes.map((p) => (
            <div key={p.id} style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>{p.nom}</h3>
                <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", ...(typeColors[p.type] || { background: "#f0f0f0", color: "#555" }) }}>
                  {p.type_display}
                </span>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: p.statut === "actif" ? "#ECFDF5" : "#FEF2F2", color: p.statut === "actif" ? "#065F46" : "#B91C1C" }}>
                  {p.statut_display}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#888", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
                <span>📅 Début : {new Date(p.date_debut).toLocaleDateString("fr-FR")}</span>
                {p.date_fin && <span>📅 Fin : {new Date(p.date_fin).toLocaleDateString("fr-FR")}</span>}
                {p.localite && <span>📍 {p.localite}</span>}
                <span>👥 {p.nombre_beneficiaires} bénéficiaire(s)</span>
              </div>
              <button
                onClick={() => alert(`Détail de ${p.nom} à venir`)}
                style={{ width: "100%", padding: "8px", background: "#f8f9fa", color: "#1F4E5F", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "1px solid #e0e0e0", cursor: "pointer" }}
              >
                Voir le programme
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}