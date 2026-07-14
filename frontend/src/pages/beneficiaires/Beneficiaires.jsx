import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Beneficiaires() {
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreGenre, setFiltreGenre] = useState("");

  const charger = () => {
    setChargement(true);
    const params = new URLSearchParams();
    if (recherche) params.append("recherche", recherche);
    if (filtreGenre) params.append("genre", filtreGenre);
    api.get(`beneficiaires/?${params.toString()}`)
      .then((res) => setBeneficiaires(res.data))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Bénéficiaires</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Gestion des fiches bénéficiaires</p>
        </div>
        <button
          onClick={() => alert("Formulaire à venir")}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          + Nouveau bénéficiaire
        </button>
      </div>

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", border: "1px solid #f0f0f0", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <input
          style={{ flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px" }}
          type="text"
          placeholder="Rechercher par nom, téléphone, localité..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select
          style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px" }}
          value={filtreGenre}
          onChange={(e) => setFiltreGenre(e.target.value)}
        >
          <option value="">Tous les genres</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
        </select>
        <button
          onClick={charger}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          Rechercher
        </button>
        <button
          onClick={() => { setRecherche(""); setFiltreGenre(""); setTimeout(charger, 100); }}
          style={{ padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          Réinitialiser
        </button>
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "1rem" }}>
          {beneficiaires.length} bénéficiaire(s)
        </div>

        {chargement ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Chargement...</div>
        ) : beneficiaires.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Aucun bénéficiaire trouvé.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nom complet", "Genre", "Téléphone", "Localité", "Statut pro", "Programmes", "Actions"].map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {beneficiaires.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px", fontSize: "13px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEF5F7", color: "#1F4E5F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px" }}>
                        {b.nom_complet?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: "500" }}>{b.nom_complet}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", background: b.genre === "femme" ? "#FDF2F8" : "#EFF6FF", color: b.genre === "femme" ? "#9D174D" : "#1E40AF" }}>
                      {b.genre_display}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.telephone}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.localite || "—"}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.statut_pro || "—"}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: "#f0f0f0", color: "#555" }}>
                      {b.nombre_programmes} programme(s)
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => alert(`Fiche de ${b.nom_complet}`)}
                      style={{ padding: "6px 12px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}