import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAR_PAGE = 15;

// ─── Composant principal ───────────────────────────────────────────────────────

export default function Beneficiaires() {
  const navigate = useNavigate();

  const [beneficiaires, setBeneficiaires]     = useState([]);
  const [chargement, setChargement]           = useState(true);
  const [recherche, setRecherche]             = useState("");
  const [filtreGenre, setFiltreGenre]         = useState("");
  const [page, setPage]                       = useState(1);
  const [showModalImport, setShowModalImport] = useState(false);
  const [fichierExcel, setFichierExcel]       = useState(null);
  const [resultImport, setResultImport]       = useState(null);
  const [envoiImport, setEnvoiImport]         = useState(false);
  const [showImportMenu, setShowImportMenu]   = useState(false);

  const importRef = useRef(null);

  // ── Fermer le menu si on clique ailleurs ──
  useEffect(() => {
    const handler = (e) => {
      if (importRef.current && !importRef.current.contains(e.target)) setShowImportMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Chargement ──
  const charger = (rech = recherche, genre = filtreGenre) => {
    setChargement(true);
    const params = new URLSearchParams();
    if (rech)  params.append("recherche", rech);
    if (genre) params.append("genre", genre);
    api.get(`beneficiaires/?${params.toString()}`)
      .then((res) => setBeneficiaires(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  // ── Filtres ──
  const handleGenreChange = (e) => {
    const val = e.target.value;
    setFiltreGenre(val);
    setPage(1);
    charger(recherche, val);
  };

  const handleRecherche = (e) => {
    e.preventDefault();
    setPage(1);
    charger(recherche, filtreGenre);
  };

  const handleReinitialiser = () => {
    setRecherche("");
    setFiltreGenre("");
    setPage(1);
    charger("", "");
  };

  // ── Suppression ──
  const handleSupprimer = (b) => {
    if (window.confirm(`Supprimer ${b.nom_complet} ? Cette action est irréversible.`)) {
      api.delete(`beneficiaires/${b.id}/`).then(() => charger());
    }
  };

  // ── Import Excel ──
  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!fichierExcel) return;
    setEnvoiImport(true);
    setResultImport(null);
    try {
      const formData = new FormData();
      formData.append("fichier", fichierExcel);
      const res = await api.post("beneficiaires/import-excel/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultImport(res.data);
      charger();
    } catch {
      setResultImport({ erreurs: ["Erreur lors de l'import."], crees: 0 });
    } finally {
      setEnvoiImport(false);
    }
  };

  // ── Télécharger modèle Excel ──
  const handleTelechargerModele = () => {
    const token = localStorage.getItem("access");
    fetch("http://localhost:8000/api/beneficiaires/modele-excel/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "modele_beneficiaires.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  // ── Import ASSO-PRO ──
  const handleImportAssoPro = () => {
    setShowImportMenu(false);
    api.post("beneficiaires/import-asso-pro/")
      .then((res) => { alert(res.data.message || res.data.erreur); charger(); })
      .catch(() => alert("Erreur lors de l'import ASSO-PRO."));
  };

  // ── Import IGBS ──
  const handleImportIGBS = () => {
    setShowImportMenu(false);
    if (window.confirm("Importer les porteurs de projets IGBS comme bénéficiaires ?")) {
      api.post("beneficiaires/import-igbs/")
        .then((res) => { alert(res.data.message); charger(); })
        .catch(() => alert("Erreur lors de l'import IGBS."));
    }
  };

  // ── Pagination ──
  const totalPages = Math.ceil(beneficiaires.length / PAR_PAGE) || 1;
  const beneficiairesPagines = beneficiaires.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  // ── Rendu ──
  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Bénéficiaires</h1>
          <p style={s.sousTitre}>Gestion des fiches bénéficiaires</p>
        </div>
      </div>

      {/* ── FILTRES ── */}
      <div style={s.card}>
        <form onSubmit={handleRecherche} style={s.filtresRow}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Rechercher par nom, téléphone, localité..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <select style={s.select} value={filtreGenre} onChange={handleGenreChange}>
            <option value="">Tous les genres</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>
          <button type="submit" style={s.btnPrimary}>Rechercher</button>
          <button type="button" onClick={handleReinitialiser} style={s.btnSecondary}>Réinitialiser</button>
        </form>
      </div>

      {/* ── TABLEAU ── */}
      <div style={{ ...s.card, marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={s.cardTitle}>{beneficiaires.length} bénéficiaire(s)</div>
          <div style={{ fontSize: "13px", color: "#888" }}>
            Page {page} / {totalPages}
          </div>
        </div>

        {chargement ? (
          <div style={s.center}>Chargement...</div>
        ) : beneficiaires.length === 0 ? (
          <div style={s.center}>Aucun bénéficiaire trouvé.</div>
        ) : (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Nom complet", "Genre", "Téléphone", "Localité", "Statut pro", "Programmes", "Actions"].map((col) => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {beneficiairesPagines.map((b) => (
                  <tr key={b.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.nomCell}>
                        <div style={s.avatar}>{b.nom_complet?.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: "500" }}>{b.nom_complet}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: b.genre === "femme" ? "#FDF2F8" : "#EFF6FF",
                        color:      b.genre === "femme" ? "#9D174D"  : "#1E40AF",
                      }}>
                        {b.genre_display}
                      </span>
                    </td>
                    <td style={s.td}>{b.telephone}</td>
                    <td style={s.td}>{b.localite || "—"}</td>
                    <td style={s.td}>{b.statut_pro || "—"}</td>
                    <td style={s.td}>
                      <span style={s.badgeGris}>{b.nombre_programmes} programme(s)</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actionsCell}>
                        <button onClick={() => navigate(`/beneficiaires/${b.id}`)} style={s.btnVoir}>Voir</button>
                        <button onClick={() => handleSupprimer(b)} style={s.btnSupprimer}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── PAGINATION ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <div style={{ fontSize: "13px", color: "#888" }}>
                Affichage de {Math.min((page - 1) * PAR_PAGE + 1, beneficiaires.length)} à {Math.min(page * PAR_PAGE, beneficiaires.length)} sur {beneficiaires.length}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ ...s.btnSecondary, opacity: page === 1 ? 0.5 : 1, padding: "8px 14px" }}
                >
                  ← Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span style={{ padding: "8px 4px", color: "#888" }}>...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        style={{
                          ...s.btnSecondary,
                          padding: "8px 14px",
                          background: p === page ? "#042C53" : "#f0f0f0",
                          color: p === page ? "#fff" : "#333",
                        }}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ ...s.btnSecondary, opacity: page === totalPages ? 0.5 : 1, padding: "8px 14px" }}
                >
                  Suivant →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── BOUTONS EN BAS ── */}
        <div style={{ display: "flex", gap: "12px", marginTop: "1.5rem", justifyContent: "flex-end" }}>
          <button
            onClick={() => { setShowModalImport(true); setResultImport(null); }}
            style={s.btnSecondary}
          >
            📥 Import Excel
          </button>
          <div ref={importRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowImportMenu(!showImportMenu)}
              style={s.btnAssoPro}
            >
              🔗 Importer ▾
            </button>
            {showImportMenu && (
              <div style={s.dropdown}>
                <button onClick={handleImportAssoPro} style={s.dropdownItem}>
                  🏢 Depuis ASSO-PRO
                </button>
                <button onClick={handleImportIGBS} style={s.dropdownItem}>
                  👤 Depuis IGBS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL IMPORT EXCEL ── */}
      {showModalImport && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: "500px" }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitre}>Import Excel</h2>
              <button onClick={() => setShowModalImport(false)} style={s.btnClose}>✕</button>
            </div>

            <div style={{ background: "#EEF5F7", padding: "12px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px", color: "#1F4E5F" }}>
              <button type="button" onClick={handleTelechargerModele} style={{ padding: "6px 12px", background: "#1F4E5F", color: "#fff", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer" }}>
                📥 Télécharger le modèle Excel
              </button>
            </div>

            <form onSubmit={handleImportExcel}>
              <div>
                <label style={s.label}>Fichier Excel *</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFichierExcel(e.target.files[0])}
                  required
                  style={{ ...s.input, padding: "8px" }}
                />
              </div>

              {resultImport && (
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ background: "#ECFDF5", color: "#065F46", padding: "10px", borderRadius: "8px", marginBottom: "8px", fontSize: "13px" }}>
                    ✅ {resultImport.crees} bénéficiaire(s) importé(s) avec succès.
                  </div>
                  {resultImport.erreurs?.length > 0 && (
                    <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "10px", borderRadius: "8px", fontSize: "12px" }}>
                      <strong>Erreurs :</strong>
                      <ul style={{ marginTop: "6px", paddingLeft: "16px" }}>
                        {resultImport.erreurs.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowModalImport(false)} style={s.btnSecondary}>Fermer</button>
                <button type="submit" disabled={envoiImport} style={{ ...s.btnPrimary, opacity: envoiImport ? 0.7 : 1 }}>
                  {envoiImport ? "Import en cours..." : "Importer"}
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
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  titre:        { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre:    { fontSize: "13px", color: "#888", marginTop: "4px" },
  card:         { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" },
  cardTitle:    { fontWeight: "600", fontSize: "14px" },
  center:       { padding: "2rem", textAlign: "center", color: "#888" },
  filtresRow:   { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  searchInput:  { flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "13px", background: "#fafafa", minWidth: "200px" },
  select:       { padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "13px", background: "#fafafa" },
  th:           { textAlign: "left", padding: "8px 10px", fontSize: "11px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:           { borderBottom: "1px solid #f5f5f5" },
  td:           { padding: "8px 10px", fontSize: "12px", color: "#444", verticalAlign: "middle" },
  nomCell:      { display: "flex", alignItems: "center", gap: "8px" },
  avatar:       { width: "28px", height: "28px", borderRadius: "50%", background: "#042C53", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "12px", flexShrink: 0 },
  badge:        { padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" },
  badgeGris:    { padding: "2px 8px", borderRadius: "20px", fontSize: "11px", background: "#f0f0f0", color: "#555" },
  btnPrimary:   { padding: "8px 14px", background: "#042C53", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "13px", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "8px 14px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "13px", border: "none", cursor: "pointer" },
  btnAssoPro:   { padding: "8px 14px", background: "#0F6E56", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "13px", border: "none", cursor: "pointer" },
  btnVoir:      { padding: "4px 10px", background: "#f0f0f0", color: "#1D4ED8", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnSupprimer: { padding: "4px 10px", background: "#FEF2F2", color: "#ef4444", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnClose:     { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:        { background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  modalTitre:   { fontSize: "18px", fontWeight: "700" },
  modalFooter:  { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" },
  label:        { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" },
  input:        { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
  dropdown:     { position: "absolute", bottom: "100%", right: 0, marginBottom: "4px", background: "#fff", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f0f0f0", zIndex: 100, minWidth: "220px", overflow: "hidden" },
  dropdownItem: { display: "block", width: "100%", padding: "12px 16px", background: "none", border: "none", textAlign: "left", fontSize: "13px", cursor: "pointer", color: "#333", fontWeight: "500" },
  actionsCell: { display: "flex", gap: "6px", flexDirection: "row" },
};