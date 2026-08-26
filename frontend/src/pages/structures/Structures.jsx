import { useEffect, useState, useRef } from "react";
import api from "../../services/api";

// ─── Constantes ───────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  association:   { background: "#EFF6FF", color: "#1E40AF" },
  entreprise:    { background: "#ECFDF5", color: "#065F46" },
  etablissement: { background: "#F5F3FF", color: "#5B21B6" },
};

// ─── Composant principal ───────────────────────────────────────────────────────

export default function Structures() {
  const [structures, setStructures]               = useState([]);
  const [chargement, setChargement]               = useState(true);
  const [filtreType, setFiltreType]               = useState("");
  const [erreur, setErreur]                       = useState("");
  const [succes, setSucces]                       = useState("");
  const [showModalMembre, setShowModalMembre]     = useState(false);
  const [structureSelectionnee, setStructureSelectionnee] = useState(null);
  const [beneficiaires, setBeneficiaires]         = useState([]);
  const [formMembre, setFormMembre]               = useState({ beneficiaire: "", role: "membre" });
  const [envoiMembre, setEnvoiMembre]             = useState(false);
  const [importEnCours, setImportEnCours]         = useState(false);
  const [showImportMenu, setShowImportMenu]       = useState(false);
  const [showExportMenu, setShowExportMenu]       = useState(false);
  const [programmes, setProgrammes]               = useState([]);

  const importRef = useRef(null);
  const exportRef = useRef(null);

  // ── Fermer les menus si on clique ailleurs ──
  useEffect(() => {
    const handler = (e) => {
      if (importRef.current && !importRef.current.contains(e.target)) setShowImportMenu(false);
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Chargement initial ──
  useEffect(() => {
    charger();
    importerAutomatique();
    api.get("programmes/").then((res) => setProgrammes(res.data));
  }, []);

  // ── Chargement structures ──
  const charger = (type = filtreType) => {
    setChargement(true);
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    api.get(`structures/?${params.toString()}`)
      .then((res) => setStructures(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  // ── Import automatique au chargement ──
  const importerAutomatique = () => {
    setImportEnCours(true);
    Promise.all([
      api.post("beneficiaires/import-asso-pro/"),
      api.post("beneficiaires/import-sageo/"),
    ]).then(([resAssoPro, resSageo]) => {
      const totalImportes = (resAssoPro.data.importees || 0) + (resSageo.data.importees || 0);
      if (totalImportes > 0) {
        setSucces(`${totalImportes} nouvelle(s) structure(s) importée(s) automatiquement.`);
        charger();
      }
    }).catch((err) => console.error("Erreur import automatique", err))
      .finally(() => setImportEnCours(false));
  };

  // ── Filtre type ──
  const handleFiltreType = (e) => {
    const val = e.target.value;
    setFiltreType(val);
    charger(val);
  };

  // ── Imports manuels ──
  const handleImportAssoPro = () => {
    setShowImportMenu(false);
    if (window.confirm("Importer les organisations depuis ASSO-PRO ?")) {
      api.post("beneficiaires/import-asso-pro/")
        .then((res) => { setSucces(res.data.message); charger(); })
        .catch(() => setErreur("Erreur lors de l'import ASSO-PRO."));
    }
  };

  const handleImportSageo = () => {
    setShowImportMenu(false);
    if (window.confirm("Importer les entreprises depuis SAGEO ?")) {
      api.post("beneficiaires/import-sageo/")
        .then((res) => { setSucces(res.data.message); charger(); })
        .catch(() => setErreur("Erreur lors de l'import SAGEO."));
    }
  };

  // ── Exports ──
  const handleExportExcel = () => {
    setShowExportMenu(false);
    api.get("dashboard/export-excel/", { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = "structures_impactlab.xlsx";
        a.click();
      })
      .catch(() => setErreur("Erreur lors de l'export Excel."));
  };

  const handleExportPDF = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleExportParProgramme = (prog) => {
    setShowExportMenu(false);
    api.get(`dashboard/export-excel/?programme_id=${prog.id}`, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `structures_${prog.nom}.xlsx`;
        a.click();
      })
      .catch(() => setErreur("Erreur lors de l'export."));
  };

  // ── Suppression ──
  const handleSupprimer = (st) => {
    if (window.confirm(`Supprimer ${st.nom} ? Cette action est irréversible.`)) {
      api.delete(`structures/${st.id}/`).then(() => charger());
    }
  };

  // ── Ajout membre ──
  const handleAjouterMembre = async (e) => {
    e.preventDefault();
    setEnvoiMembre(true);
    try {
      await api.post(`structures/${structureSelectionnee.id}/membres/`, formMembre);
      setSucces(`Membre ajouté à ${structureSelectionnee.nom}`);
      setShowModalMembre(false);
      setFormMembre({ beneficiaire: "", role: "membre" });
      charger();
    } catch {
      setErreur("Erreur lors de l'ajout du membre.");
    } finally {
      setEnvoiMembre(false);
    }
  };

  const ouvrirModalMembre = (st) => {
    setStructureSelectionnee(st);
    setFormMembre({ beneficiaire: "", role: "membre" });
    setErreur("");
    api.get("beneficiaires/").then((res) => setBeneficiaires(res.data));
    setShowModalMembre(true);
  };

  // ── Rendu ──
  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Structures</h1>
          <p style={s.sousTitre}>
            Associations, entreprises incubées et établissements scolaires
            {importEnCours && <span style={{ marginLeft: "10px", fontSize: "12px", color: "#888" }}>🔄 Synchronisation en cours...</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>

          {/* ── Bouton Import ── */}
          <div ref={importRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setShowImportMenu(!showImportMenu); setShowExportMenu(false); }}
              style={s.btnAssoPro}
            >
              🔗 Importer ▾
            </button>
            {showImportMenu && (
              <div style={s.dropdown}>
                <button onClick={handleImportAssoPro} style={s.dropdownItem}>
                  🏢 Depuis ASSO-PRO
                </button>
                <button onClick={handleImportSageo} style={s.dropdownItem}>
                  🏭 Depuis SAGEO
                </button>
              </div>
            )}
          </div>

          {/* ── Bouton Export ── */}
          <div ref={exportRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setShowExportMenu(!showExportMenu); setShowImportMenu(false); }}
              style={s.btnPrimary}
            >
              📤 Exporter ▾
            </button>
            {showExportMenu && (
              <div style={{ ...s.dropdown, maxHeight: "300px", overflowY: "auto" }}>
                <button onClick={handleExportExcel} style={s.dropdownItem}>
                  📊 Toutes les structures (Excel)
                </button>
                <button onClick={handleExportPDF} style={s.dropdownItem}>
                  📄 Toutes les structures (PDF)
                </button>
                {programmes.length > 0 && (
                  <>
                    <div style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }} />
                    <div style={{ padding: "8px 16px", fontSize: "11px", color: "#aaa", fontWeight: "600", textTransform: "uppercase" }}>
                      Par programme
                    </div>
                    {programmes.map((prog) => (
                      <button
                        key={prog.id}
                        onClick={() => handleExportParProgramme(prog)}
                        style={s.dropdownItem}
                      >
                        📋 {prog.nom}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── MESSAGES ── */}
      {succes && <div style={s.alertSuccess}>✅ {succes}</div>}
      {erreur && <div style={s.alertError}>❌ {erreur}</div>}

      {/* ── FILTRES ── */}
      <div style={{ ...s.card, marginBottom: "1rem", display: "flex", gap: "12px", alignItems: "center" }}>
        <label style={s.label}>Filtrer par type :</label>
        <select value={filtreType} onChange={handleFiltreType} style={s.select}>
          <option value="">Tous les types</option>
          <option value="association">Association</option>
          <option value="entreprise">Entreprise incubée</option>
          <option value="etablissement">Établissement scolaire</option>
        </select>
      </div>

      {/* ── TABLEAU ── */}
      <div style={s.card}>
        <div style={s.cardTitle}>{structures.length} structure(s)</div>

        {chargement ? (
          <div style={s.center}>Chargement...</div>
        ) : structures.length === 0 ? (
          <div style={s.center}>Aucune structure trouvée.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Nom", "Type", "Source", "Secteur", "Niveau de professionnalisation", "Membres", "Actions"].map((col) => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {structures.map((st) => (
                <tr key={st.id} style={s.tr}>

                  {/* Nom */}
                  <td style={{ ...s.td, fontWeight: "500" }}>{st.nom}</td>

                  {/* Type */}
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(TYPE_COLORS[st.type] || {}) }}>
                      {st.type_display}
                    </span>
                  </td>

                  {/* Source */}
                  <td style={s.td}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                      background: st.source === "asso_pro" ? "#EEF5F7" :
                                  st.source === "sageo"    ? "#F5F3FF" : "#f0f0f0",
                      color: st.source === "asso_pro" ? "#1F4E5F" :
                             st.source === "sageo"    ? "#5B21B6" : "#555",
                    }}>
                      {st.source_display}
                    </span>
                  </td>

                  {/* Secteur */}
                  <td style={s.td}>{st.secteur || "—"}</td>

                  {/* Niveau de professionnalisation */}
                  <td style={s.td}>
                    {st.niveau_professionnalisation ? (
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: st.niveau_professionnalisation.includes("Élevé") ? "#ECFDF5" :
                                    st.niveau_professionnalisation.includes("Moyen") ? "#FEF9EC" : "#FEF2F2",
                        color: st.niveau_professionnalisation.includes("Élevé") ? "#065F46" :
                               st.niveau_professionnalisation.includes("Moyen") ? "#92400E" : "#B91C1C",
                      }}>
                        {st.niveau_professionnalisation}
                      </span>
                    ) : "—"}
                  </td>

                  {/* Membres */}
                  <td style={s.td}>
                    <span style={s.badgeGris}>{st.nombre_membres} membre(s)</span>
                  </td>

                  {/* Actions */}
                  <td style={s.td}>
                    <div style={s.actionsCell}>
                      <button onClick={() => ouvrirModalMembre(st)} style={s.btnVoir}>
                        + Membre
                      </button>
                      <button onClick={() => handleSupprimer(st)} style={s.btnSupprimer}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL AJOUT MEMBRE ── */}
      {showModalMembre && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: "480px" }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitre}>Ajouter un membre à {structureSelectionnee?.nom}</h2>
              <button onClick={() => setShowModalMembre(false)} style={s.btnClose}>✕</button>
            </div>

            {erreur && <div style={s.alertError}>{erreur}</div>}

            <form onSubmit={handleAjouterMembre}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={s.label}>Bénéficiaire *</label>
                  <select
                    value={formMembre.beneficiaire}
                    onChange={(e) => setFormMembre({ ...formMembre, beneficiaire: e.target.value })}
                    required
                    style={s.input}
                  >
                    <option value="">Sélectionner</option>
                    {beneficiaires.map((b) => (
                      <option key={b.id} value={b.id}>{b.nom_complet}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Rôle *</label>
                  <select
                    value={formMembre.role}
                    onChange={(e) => setFormMembre({ ...formMembre, role: e.target.value })}
                    required
                    style={s.input}
                  >
                    <option value="membre">Membre</option>
                    <option value="porteur">Porteur de projet</option>
                    <option value="cofondateur">Co-fondateur</option>
                    <option value="representant">Représentant</option>
                  </select>
                </div>
              </div>

              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowModalMembre(false)} style={s.btnSecondary}>Annuler</button>
                <button type="submit" disabled={envoiMembre} style={{ ...s.btnPrimary, opacity: envoiMembre ? 0.7 : 1 }}>
                  {envoiMembre ? "Ajout..." : "Ajouter"}
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
  cardTitle:    { fontWeight: "600", fontSize: "14px", marginBottom: "1rem" },
  center:       { padding: "2rem", textAlign: "center", color: "#888" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:           { borderBottom: "1px solid #f5f5f5" },
  td:           { padding: "12px", fontSize: "13px", color: "#444", verticalAlign: "middle" },
  badge:        { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  badgeGris:    { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: "#f0f0f0", color: "#555" },
  select:       { padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
  actionsCell:  { display: "flex", gap: "8px" },
  btnPrimary:   { padding: "10px 18px", background: "#042C53", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnAssoPro:   { padding: "10px 18px", background: "#0F6E56", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnVoir:      { padding: "6px 12px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnSupprimer: { padding: "6px 12px", background: "#FEF2F2", color: "#B91C1C", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" },
  btnClose:     { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" },
  alertSuccess: { background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  alertError:   { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:        { background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  modalTitre:   { fontSize: "18px", fontWeight: "700" },
  modalFooter:  { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" },
  label:        { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" },
  input:        { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
  dropdown:     { position: "absolute", top: "100%", right: 0, marginTop: "4px", background: "#fff", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f0f0f0", zIndex: 100, minWidth: "220px", overflow: "hidden" },
  dropdownItem: { display: "block", width: "100%", padding: "12px 16px", background: "none", border: "none", textAlign: "left", fontSize: "13px", cursor: "pointer", color: "#333", fontWeight: "500" },
};