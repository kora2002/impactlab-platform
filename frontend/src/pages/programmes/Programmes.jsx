import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Programmes() {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    type: "",
    description: "",
    objectifs: "",
    date_debut: "",
    date_fin: "",
    statut: "actif",
    localite: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = () => {
    setChargement(true);
    api.get("programmes/")
      .then((res) => setProgrammes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    try {
      await api.post("programmes/", form);
      setShowModal(false);
      setForm({ nom: "", type: "", description: "", objectifs: "", date_debut: "", date_fin: "", statut: "actif", localite: "" });
      charger();
    } catch {
      setErreur("Erreur lors de la création. Vérifiez les champs obligatoires.");
    } finally {
      setEnvoi(false);
    }
  };

  const typeColors = {
    incubation: { background: "#EEEDFE", color: "#26215C" },
    insertion:  { background: "#E1F5EE", color: "#04342C" },
    education:  { background: "#E6F1FB", color: "#042C53" },
    conseil:    { background: "#FAEEDA", color: "#412402" },
  };

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Programmes</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Gestion des programmes Impact'Lab GDC</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
        >
          + Nouveau programme
        </button>
      </div>

      {/* Liste */}
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
                onClick={() => navigate(`/programmes/${p.id}`)}
                style={{ width: "100%", padding: "8px", background: "#f8f9fa", color: "#1F4E5F", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "1px solid #e0e0e0", cursor: "pointer" }}
              >
                Voir le programme
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal création */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Nouveau programme</h2>
              <button
                onClick={() => { setShowModal(false); setErreur(""); }}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            </div>

            {erreur && (
              <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                <Field label="Nom du programme *" name="nom" value={form.nom} onChange={handleFormChange} required />

                <div>
                  <label style={labelStyle}>Type *</label>
                  <select name="type" value={form.type} onChange={handleFormChange} required style={inputStyle}>
                    <option value="">Sélectionner</option>
                    <option value="insertion">Insertion / Emploi</option>
                    <option value="incubation">Incubation / Entrepreneuriat</option>
                    <option value="education">Éducation</option>
                    <option value="conseil">Conseil / Accompagnement</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Statut</label>
                  <select name="statut" value={form.statut} onChange={handleFormChange} style={inputStyle}>
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Date de début *" name="date_debut" type="date" value={form.date_debut} onChange={handleFormChange} required />
                  <Field label="Date de fin" name="date_fin" type="date" value={form.date_fin} onChange={handleFormChange} />
                </div>

                <Field label="Localité" name="localite" value={form.localite} onChange={handleFormChange} />

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="Décrivez le programme..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Objectifs</label>
                  <textarea
                    name="objectifs"
                    value={form.objectifs}
                    onChange={handleFormChange}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="Objectifs du programme..."
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErreur(""); }}
                  style={{ padding: "10px 20px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  style={{ padding: "10px 20px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer", opacity: envoi ? 0.7 : 1 }}
                >
                  {envoi ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "500",
  color: "#444",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1.5px solid #e0e0e0",
  fontSize: "14px",
  background: "#fafafa",
};