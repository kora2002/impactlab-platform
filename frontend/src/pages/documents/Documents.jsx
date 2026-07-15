import { useEffect, useState } from "react";
import api from "../../services/api";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FORM_VIDE = {
  nom: "",
  type_doc: "",
  beneficiaire: "",
  description: "",
  fichier: null,
};

const TYPE_DOC_COLORS = {
  cv:             { background: "#EFF6FF", color: "#1E40AF" },
  piece_identite: { background: "#F5F3FF", color: "#5B21B6" },
  certificat:     { background: "#ECFDF5", color: "#065F46" },
  photo:          { background: "#FDF2F8", color: "#9D174D" },
  livrable:       { background: "#FEF9EC", color: "#92400E" },
  rapport:        { background: "#FEF2F2", color: "#B91C1C" },
  convention:     { background: "#E6F1FB", color: "#042C53" },
  autre:          { background: "#f0f0f0", color: "#555" },
};

const ACCEPT_PAR_TYPE = {
  cv:             { accept: ".pdf,.doc,.docx", label: "PDF, Word" },
  piece_identite: { accept: ".pdf,.jpg,.jpeg,.png", label: "PDF, JPG, PNG" },
  photo:          { accept: ".jpg,.jpeg,.png", label: "JPG, PNG" },
  certificat:     { accept: ".pdf", label: "PDF uniquement" },
  convention:     { accept: ".pdf", label: "PDF uniquement" },
  rapport:        { accept: ".pdf,.xlsx,.xls", label: "PDF, Excel" },
  livrable:       { accept: ".pdf,.doc,.docx,.pptx", label: "PDF, Word, PowerPoint" },
  autre:          { accept: "*", label: "Tous formats" },
};

// ─── Composant principal ───────────────────────────────────────────────────────

export default function Documents() {
  const [documents, setDocuments]       = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [chargement, setChargement]     = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(FORM_VIDE);
  const [envoi, setEnvoi]               = useState(false);
  const [erreur, setErreur]             = useState("");
  const [succes, setSucces]             = useState("");

  // ── Chargement des données ──
  const charger = () => {
    setChargement(true);
    Promise.all([
      api.get("documents/"),
      api.get("beneficiaires/"),
    ]).then(([d, b]) => {
      setDocuments(d.data);
      setBeneficiaires(b.data);
    }).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  // ── Soumission du formulaire ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    try {
      const formData = new FormData();
      formData.append("nom", form.nom);
      formData.append("type_doc", form.type_doc);
      formData.append("description", form.description);
      if (form.beneficiaire) formData.append("beneficiaire", form.beneficiaire);
      if (form.fichier)      formData.append("fichier", form.fichier);

      await api.post("documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSucces("Document uploadé avec succès.");
      setShowModal(false);
      setForm(FORM_VIDE);
      charger();
    } catch {
      setErreur("Erreur lors de l'upload. Vérifiez le type de fichier.");
    } finally {
      setEnvoi(false);
    }
  };

  const ouvrirModal = () => {
    setShowModal(true);
    setErreur("");
    setSucces("");
    setForm(FORM_VIDE);
  };

  // ── Infos du type sélectionné ──
  const infoType = ACCEPT_PAR_TYPE[form.type_doc] || null;

  // ── Rendu ──
  return (
    <div>

      {/* En-tête */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Documents</h1>
          <p style={s.sousTitre}>Gestion des pièces jointes</p>
        </div>
        <button onClick={ouvrirModal} style={s.btnPrimary}>
          + Nouveau document
        </button>
      </div>

      {/* Message succès */}
      {succes && (
        <div style={s.alertSuccess}>✅ {succes}</div>
      )}

      {/* Tableau des documents */}
      <div style={s.card}>
        <div style={s.cardTitle}>{documents.length} document(s)</div>

        {chargement ? (
          <div style={s.center}>Chargement...</div>
        ) : documents.length === 0 ? (
          <div style={s.center}>Aucun document enregistré.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Nom", "Type", "Bénéficiaire", "Description", "Date", "Fichier"].map((col) => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} style={s.tr}>
                  <td style={s.td}>{doc.nom}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(TYPE_DOC_COLORS[doc.type_doc] || TYPE_DOC_COLORS.autre) }}>
                      {doc.type_doc_display}
                    </span>
                  </td>
                  <td style={s.td}>{doc.beneficiaire || "—"}</td>
                  <td style={s.td}>{doc.description || "—"}</td>
                  <td style={s.td}>{new Date(doc.date_upload).toLocaleDateString("fr-FR")}</td>
                  <td style={s.td}>
                    {doc.fichier
                      ? (
                        <button
                          onClick={() => window.open(doc.fichier, "_blank")}
                          style={s.btnVoir}
                        >
                          Voir
                        </button>
                      )
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal upload */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>

            {/* En-tête modal */}
            <div style={s.modalHeader}>
              <h2 style={s.modalTitre}>Nouveau document</h2>
              <button onClick={() => setShowModal(false)} style={s.btnClose}>✕</button>
            </div>

            {/* Erreur */}
            {erreur && <div style={s.alertError}>{erreur}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>

                {/* Nom */}
                <div>
                  <label style={s.label}>Nom du document *</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                    placeholder="Ex: CV Fatou Koné"
                    style={s.input}
                  />
                </div>

                {/* Type */}
                <div>
                  <label style={s.label}>Type *</label>
                  <select
                    value={form.type_doc}
                    onChange={(e) => setForm({ ...form, type_doc: e.target.value, fichier: null })}
                    required
                    style={s.input}
                  >
                    <option value="">Sélectionner</option>
                    <option value="cv">CV</option>
                    <option value="piece_identite">Pièce d'identité</option>
                    <option value="certificat">Certificat</option>
                    <option value="photo">Photo</option>
                    <option value="livrable">Livrable</option>
                    <option value="rapport">Rapport</option>
                    <option value="convention">Convention</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Bénéficiaire */}
                <div>
                  <label style={s.label}>Bénéficiaire concerné</label>
                  <select
                    value={form.beneficiaire}
                    onChange={(e) => setForm({ ...form, beneficiaire: e.target.value })}
                    style={s.input}
                  >
                    <option value="">Aucun (document général)</option>
                    {beneficiaires.map((b) => (
                      <option key={b.id} value={b.id}>{b.nom_complet}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label style={s.label}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="Description optionnelle..."
                    style={{ ...s.input, resize: "vertical" }}
                  />
                </div>

                {/* Fichier */}
                <div>
                  <label style={s.label}>Fichier *</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, fichier: e.target.files[0] })}
                    required
                    accept={infoType ? infoType.accept : "*"}
                    disabled={!form.type_doc}
                    style={{ ...s.input, padding: "8px", opacity: !form.type_doc ? 0.5 : 1 }}
                  />
                  {infoType && (
                    <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                      Formats acceptés : {infoType.label}
                    </p>
                  )}
                  {!form.type_doc && (
                    <p style={{ fontSize: "11px", color: "#B91C1C", marginTop: "4px" }}>
                      Sélectionnez d'abord un type de document
                    </p>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div style={s.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={s.btnSecondary}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  style={{ ...s.btnPrimary, opacity: envoi ? 0.7 : 1 }}
                >
                  {envoi ? "Upload en cours..." : "Enregistrer"}
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
  btnPrimary:   { padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 20px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnVoir:      { padding: "6px 12px", background: "#EEF5F7", color: "#1F4E5F", borderRadius: "8px", fontSize: "12px", fontWeight: "500", border: "none", cursor: "pointer" },
  btnClose:     { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" },
  alertSuccess: { background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  alertError:   { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:        { background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  modalTitre:   { fontSize: "18px", fontWeight: "700" },
  modalFooter:  { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" },
  formGrid:     { display: "flex", flexDirection: "column", gap: "1rem" },
  label:        { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" },
  input:        { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
};