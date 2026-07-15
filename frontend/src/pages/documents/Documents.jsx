import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [form, setForm] = useState({
    nom: "",
    type_doc: "",
    beneficiaire: "",
    description: "",
    fichier: null,
  });

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
      if (form.fichier) formData.append("fichier", form.fichier);

      await api.post("documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSucces("Document uploadé avec succès.");
      setShowModal(false);
      setForm({ nom: "", type_doc: "", beneficiaire: "", description: "", fichier: null });
      charger();
    } catch {
      setErreur("Erreur lors de l'upload.");
    } finally {
      setEnvoi(false);
    }
  };

  const typeDocColors = {
    cv:             { background: "#EFF6FF", color: "#1E40AF" },
    piece_identite: { background: "#F5F3FF", color: "#5B21B6" },
    certificat:     { background: "#ECFDF5", color: "#065F46" },
    photo:          { background: "#FDF2F8", color: "#9D174D" },
    livrable:       { background: "#FEF9EC", color: "#92400E" },
    rapport:        { background: "#FEF2F2", color: "#B91C1C" },
    convention:     { background: "#E6F1FB", color: "#042C53" },
    autre:          { background: "#f0f0f0", color: "#555" },
  };

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Documents</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Gestion des pièces jointes</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErreur(""); setSucces(""); }}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          + Nouveau document
        </button>
      </div>

      {/* Message succès */}
      {succes && (
        <div style={{ background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
          ✅ {succes}
        </div>
      )}

      {/* Liste */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "1rem" }}>
          {documents.length} document(s)
        </div>

        {chargement ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Chargement...</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Aucun document enregistré.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nom", "Type", "Bénéficiaire", "Description", "Date", "Fichier"].map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px", fontSize: "13px", fontWeight: "500" }}>{doc.nom}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", ...(typeDocColors[doc.type_doc] || typeDocColors.autre) }}>
                      {doc.type_doc_display}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                    {doc.beneficiaire || "—"}
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                    {doc.description || "—"}
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                    {new Date(doc.date_upload).toLocaleDateString("fr-FR")}
                  </td>
                  <td style={{ padding: "12px" }}>
                  {doc.fichier
  ? <button
      onClick={() => window.open(doc.fichier, "_blank")}
      style={{ padding: "6px 12px", background: "#EEF5F7", color: "#1F4E5F", borderRadius: "8px", fontSize: "12px", fontWeight: "500", border: "none", cursor: "pointer" }}
    >
      Voir
    </button>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Nouveau document</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}>✕</button>
            </div>

            {erreur && (
              <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                <div>
                  <label style={labelStyle}>Nom du document *</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                    style={inputStyle}
                    placeholder="Ex: CV Fatou Koné"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Type *</label>
                  <select
                    value={form.type_doc}
                    onChange={(e) => setForm({ ...form, type_doc: e.target.value })}
                    required
                    style={inputStyle}
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

                <div>
                  <label style={labelStyle}>Bénéficiaire concerné</label>
                  <select
                    value={form.beneficiaire}
                    onChange={(e) => setForm({ ...form, beneficiaire: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Aucun (document général)</option>
                    {beneficiaires.map((b) => (
                      <option key={b.id} value={b.id}>{b.nom_complet}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="Description optionnelle..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Fichier *</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, fichier: e.target.files[0] })}
                    required
                    style={{ ...inputStyle, padding: "8px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 20px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  style={{ padding: "10px 20px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer", opacity: envoi ? 0.7 : 1 }}
                >
                  {envoi ? "Upload..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" };