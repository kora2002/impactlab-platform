import { useState } from "react";
import api from "../../services/api";


const FORM_VIDE = {
  url: "",
  auth_type: "bearer",
  token: "",
  username: "",
  password: "",
  destination: "beneficiaires",
};

export default function Connecteurs() {
  const [form, setForm]             = useState(FORM_VIDE);
  const [etape, setEtape]           = useState(1);
  const [donnees, setDonnees]       = useState([]);
  const [champsApi, setChampsApi]   = useState([]);
  const [mapping, setMapping]       = useState({});
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur]         = useState("");
  const [succes, setSucces]         = useState("");

  // Champs disponibles selon la destination
  const CHAMPS_BENEFICIAIRE = [
    { key: "nom", label: "Nom *" },
    { key: "prenom", label: "Prénom *" },
    { key: "genre", label: "Genre (homme/femme)" },
    { key: "email", label: "Email" },
    { key: "telephone", label: "Téléphone" },
    { key: "localite", label: "Localité" },
  ];

  const CHAMPS_STRUCTURE = [
    { key: "nom", label: "Nom *" },
    { key: "type", label: "Type (association/entreprise/etablissement)" },
    { key: "secteur", label: "Secteur" },
    { key: "contact_email", label: "Email" },
    { key: "contact_tel", label: "Téléphone" },
    { key: "contact_nom", label: "Contact (nom)" },
  ];

  const champsDestination = form.destination === "beneficiaires"
    ? CHAMPS_BENEFICIAIRE
    : CHAMPS_STRUCTURE;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Étape 1 — Tester la connexion
  const handleTesterConnexion = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    try {
      const res = await api.post("connecteurs/tester/", form);
      if (res.data.erreur) {
        setErreur(res.data.erreur);
      } else {
        setDonnees(res.data.donnees || []);
        // Extraire les champs disponibles depuis la première entrée
        if (res.data.donnees && res.data.donnees.length > 0) {
          setChampsApi(Object.keys(res.data.donnees[0]));
        }
        setEtape(2);
      }
    } catch {
      setErreur("Impossible de contacter cette API.");
    } finally {
      setChargement(false);
    }
  };

  // Étape 2 — Mapper les champs et importer
  const handleImporter = async () => {
    setChargement(true);
    setErreur("");
    try {
      const res = await api.post("connecteurs/importer/", {
        ...form,
        mapping,
        donnees,
      });
      setSucces(res.data.message);
      setEtape(3);
    } catch {
      setErreur("Erreur lors de l'import.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>Connecteurs API</h1>
          <p style={s.sousTitre}>Connectez une nouvelle API et importez ses données</p>
        </div>
      </div>

      {/* ── ÉTAPES ── */}
      <div style={s.etapesBar}>
        {["1. Configurer l'API", "2. Mapper les champs", "3. Résultat"].map((label, i) => (
          <div key={i} style={{
            ...s.etape,
            background: etape === i + 1 ? "#042C53" : etape > i + 1 ? "#0F6E56" : "#f0f0f0",
            color: etape >= i + 1 ? "#fff" : "#888",
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* ── MESSAGES ── */}
      {erreur && <div style={s.alertError}>❌ {erreur}</div>}
      {succes && <div style={s.alertSuccess}>✅ {succes}</div>}

      {/* ── ÉTAPE 1 — Configuration ── */}
      {etape === 1 && (
        <div style={s.card}>
          <div style={s.cardTitle}>Configuration de l'API</div>
          <form onSubmit={handleTesterConnexion}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              <div>
                <label style={s.label}>URL de l'API *</label>
                <input
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  required
                  placeholder="https://api.exemple.com/api/v1/beneficiaires/"
                  style={s.input}
                />
              </div>

              <div>
                <label style={s.label}>Type d'authentification *</label>
                <select name="auth_type" value={form.auth_type} onChange={handleChange} style={s.input}>
                  <option value="bearer">Bearer Token (JWT)</option>
                  <option value="apikey">Clé API</option>
                  <option value="basic">Username / Password</option>
                  <option value="none">Aucune authentification</option>
                </select>
              </div>

              {form.auth_type === "bearer" && (
                <div>
                  <label style={s.label}>Token *</label>
                  <input name="token" value={form.token} onChange={handleChange} placeholder="eyJhbG..." style={s.input} />
                </div>
              )}

              {form.auth_type === "apikey" && (
                <div>
                  <label style={s.label}>Clé API *</label>
                  <input name="token" value={form.token} onChange={handleChange} placeholder="Votre clé API" style={s.input} />
                </div>
              )}

              {form.auth_type === "basic" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={s.label}>Nom d'utilisateur *</label>
                    <input name="username" value={form.username} onChange={handleChange} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Mot de passe *</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} style={s.input} />
                  </div>
                </div>
              )}

              <div>
                <label style={s.label}>Destination des données *</label>
                <select name="destination" value={form.destination} onChange={handleChange} style={s.input}>
                  <option value="beneficiaires">Bénéficiaires</option>
                  <option value="structures">Structures</option>
                </select>
              </div>

            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={chargement} style={{ ...s.btnPrimary, opacity: chargement ? 0.7 : 1 }}>
                {chargement ? "Test en cours..." : "Tester la connexion →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── ÉTAPE 2 — Mapping des champs ── */}
      {etape === 2 && (
        <div style={s.card}>
          <div style={s.cardTitle}>
            Mapper les champs — {donnees.length} enregistrement(s) trouvé(s)
          </div>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "1rem" }}>
            Pour chaque champ de votre destination, sélectionnez le champ correspondant dans l'API.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            {champsDestination.map((champ) => (
              <div key={champ.key}>
                <label style={s.label}>{champ.label}</label>
                <select
                  value={mapping[champ.key] || ""}
                  onChange={(e) => setMapping({ ...mapping, [champ.key]: e.target.value })}
                  style={s.input}
                >
                  <option value="">— Ne pas importer —</option>
                  {champsApi.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Aperçu des données */}
          <div style={s.cardTitle}>Aperçu des données ({Math.min(3, donnees.length)} premiers)</div>
          <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {champsApi.slice(0, 6).map((c) => (
                    <th key={c} style={s.th}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donnees.slice(0, 3).map((d, i) => (
                  <tr key={i} style={s.tr}>
                    {champsApi.slice(0, 6).map((c) => (
                      <td key={c} style={s.td}>{String(d[c] || "—").substring(0, 30)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button onClick={() => setEtape(1)} style={s.btnSecondary}>← Retour</button>
            <button onClick={handleImporter} disabled={chargement} style={{ ...s.btnPrimary, opacity: chargement ? 0.7 : 1 }}>
              {chargement ? "Import en cours..." : `Importer ${donnees.length} enregistrement(s) →`}
            </button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 — Résultat ── */}
      {etape === 3 && (
        <div style={s.card}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>✅</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#042C53", marginBottom: "0.5rem" }}>
              Import réussi !
            </div>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "2rem" }}>{succes}</div>
            <button
              onClick={() => { setEtape(1); setForm(FORM_VIDE); setSucces(""); setErreur(""); setDonnees([]); setMapping({}); }}
              style={s.btnPrimary}
            >
              + Connecter une autre API
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  titre:        { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre:    { fontSize: "13px", color: "#888", marginTop: "4px" },
  etapesBar:    { display: "flex", gap: "8px", marginBottom: "1.5rem" },
  etape:        { flex: 1, padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "13px", fontWeight: "600" },
  card:         { background: "#fff", borderRadius: "12px", padding: "1.5rem", border: "1px solid #f0f0f0", marginBottom: "1rem" },
  cardTitle:    { fontWeight: "700", fontSize: "15px", color: "#1a1a1a", marginBottom: "1rem" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" },
  tr:           { borderBottom: "1px solid #f5f5f5" },
  td:           { padding: "12px", fontSize: "13px", color: "#444" },
  btnPrimary:   { padding: "10px 20px", background: "#042C53", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 20px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  alertSuccess: { background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  alertError:   { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  label:        { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" },
  input:        { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" },
};