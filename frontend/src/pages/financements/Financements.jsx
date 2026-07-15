import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Financements() {
  const [financements, setFinancements] = useState([]);
  const [bailleurs, setBailleurs] = useState([]);
  const [total, setTotal] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [showModalFinancement, setShowModalFinancement] = useState(false);
  const [showModalBailleur, setShowModalBailleur] = useState(false);
  const [financementEnCoursId, setFinancementEnCoursId] = useState(null);
  const [programmes, setProgrammes] = useState([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  const formFinancementVide = {
    programme: "",
    bailleur: "",
    montant_prevu: "",
    montant_realise: "",
    date_debut: "",
    echeance: "",
    convention_ref: "",
    statut: "en_cours",
    notes: "",
  };

  const formBailleurVide = {
    nom: "",
    type: "",
    contact: "",
    email: "",
    pays: "",
  };

  const [formFinancement, setFormFinancement] = useState(formFinancementVide);
  const [formBailleur, setFormBailleur] = useState(formBailleurVide);

  const charger = () => {
    setChargement(true);
    Promise.all([
      api.get("financements/"),
      api.get("financements/bailleurs/"),
      api.get("financements/total/"),
      api.get("programmes/"),
    ]).then(([f, b, t, p]) => {
      setFinancements(f.data);
      setBailleurs(b.data);
      setTotal(t.data);
      setProgrammes(p.data);
    }).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const handleSubmitFinancement = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    try {
      if (financementEnCoursId) {
        await api.put(`financements/${financementEnCoursId}/`, formFinancement);
        setSucces("Financement modifié avec succès.");
      } else {
        await api.post("financements/", formFinancement);
        setSucces("Financement créé avec succès.");
      }
      setShowModalFinancement(false);
      setFormFinancement(formFinancementVide);
      setFinancementEnCoursId(null);
      charger();
    } catch {
      setErreur("Erreur lors de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  };

  const handleSubmitBailleur = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    try {
      await api.post("financements/bailleurs/", formBailleur);
      setSucces("Bailleur créé avec succès.");
      setShowModalBailleur(false);
      setFormBailleur(formBailleurVide);
      charger();
    } catch {
      setErreur("Erreur lors de la création.");
    } finally {
      setEnvoi(false);
    }
  };

  const formatMontant = (montant) => {
    if (!montant) return "0 FCFA";
    if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M FCFA`;
    if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K FCFA`;
    return `${montant} FCFA`;
  };

  const statutColors = {
    en_cours: { background: "#E6F1FB", color: "#042C53" },
    termine:  { background: "#ECFDF5", color: "#065F46" },
    suspendu: { background: "#FEF2F2", color: "#B91C1C" },
  };

  if (chargement) return <div style={{ padding: "2rem", color: "#888" }}>Chargement...</div>;

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Financements</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Gestion des financements et bailleurs</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => { setShowModalBailleur(true); setErreur(""); }}
            style={{ padding: "10px 18px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
          >
            + Nouveau bailleur
          </button>
          <button
            onClick={() => {
              setShowModalFinancement(true);
              setErreur("");
              setFinancementEnCoursId(null);
              setFormFinancement(formFinancementVide);
            }}
            style={{ padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
          >
            + Nouveau financement
          </button>
        </div>
      </div>

      {/* Message succès */}
      {succes && (
        <div style={{ background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
          ✅ {succes}
        </div>
      )}

      {/* Indicateurs globaux */}
      {total && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", borderTop: "3px solid #1F4E5F" }}>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#1F4E5F" }}>{formatMontant(total.total_prevu)}</div>
            <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>Total prévu</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", borderTop: "3px solid #0F6E56" }}>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0F6E56" }}>{formatMontant(total.total_realise)}</div>
            <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>Total réalisé</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", borderTop: "3px solid #BA7517" }}>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#BA7517" }}>{total.taux_global}%</div>
            <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>Taux d'exécution global</div>
          </div>
        </div>
      )}

      {/* Tableau financements */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0", marginBottom: "1rem" }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "1rem" }}>
          {financements.length} financement(s)
        </div>
        {financements.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Aucun financement enregistré.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Programme", "Bailleur", "Montant prévu", "Montant réalisé", "Taux", "Échéance", "Statut", "Actions"].map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {financements.map((f) => (
                <tr key={f.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px", fontSize: "13px", fontWeight: "500" }}>{f.programme_nom}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{f.bailleur_nom}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{formatMontant(f.montant_prevu)}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{formatMontant(f.montant_realise)}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "6px", background: "#f0f0f0", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(f.taux_execution, 100)}%`, height: "100%", background: f.taux_execution >= 100 ? "#0F6E56" : "#1F4E5F", borderRadius: "99px" }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#444", minWidth: "36px" }}>{f.taux_execution}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                    {f.echeance ? new Date(f.echeance).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", ...(statutColors[f.statut] || {}) }}>
                      {f.statut_display}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => {
                        setFormFinancement({
                          programme: f.programme,
                          bailleur: f.bailleur,
                          montant_prevu: f.montant_prevu,
                          montant_realise: f.montant_realise,
                          date_debut: f.date_debut,
                          echeance: f.echeance || "",
                          convention_ref: f.convention_ref || "",
                          statut: f.statut,
                          notes: f.notes || "",
                        });
                        setFinancementEnCoursId(f.id);
                        setShowModalFinancement(true);
                        setErreur("");
                      }}
                      style={{ padding: "6px 12px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tableau bailleurs */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "1rem" }}>
          {bailleurs.length} bailleur(s)
        </div>
        {bailleurs.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Aucun bailleur enregistré.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nom", "Type", "Pays", "Contact", "Email"].map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#888", borderBottom: "2px solid #f0f0f0", textTransform: "uppercase" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bailleurs.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px", fontSize: "13px", fontWeight: "500" }}>{b.nom}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.type_display}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.pays || "—"}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.contact || "—"}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>{b.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal financement (création + modification) */}
      {showModalFinancement && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
                {financementEnCoursId ? "Modifier le financement" : "Nouveau financement"}
              </h2>
              <button onClick={() => setShowModalFinancement(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}>✕</button>
            </div>

            {erreur && (
              <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmitFinancement}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Programme *</label>
                  <select
                    value={formFinancement.programme}
                    onChange={(e) => setFormFinancement({ ...formFinancement, programme: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Sélectionner</option>
                    {programmes.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Bailleur *</label>
                  <select
                    value={formFinancement.bailleur}
                    onChange={(e) => setFormFinancement({ ...formFinancement, bailleur: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Sélectionner</option>
                    {bailleurs.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field
                    label="Montant prévu (FCFA) *"
                    name="montant_prevu"
                    type="number"
                    value={formFinancement.montant_prevu}
                    onChange={(e) => setFormFinancement({ ...formFinancement, montant_prevu: e.target.value })}
                    required
                  />
                  <Field
                    label="Montant réalisé (FCFA)"
                    name="montant_realise"
                    type="number"
                    value={formFinancement.montant_realise}
                    onChange={(e) => setFormFinancement({ ...formFinancement, montant_realise: e.target.value })}
                  />
                  <Field
                    label="Date de début *"
                    name="date_debut"
                    type="date"
                    value={formFinancement.date_debut}
                    onChange={(e) => setFormFinancement({ ...formFinancement, date_debut: e.target.value })}
                    required
                  />
                  <Field
                    label="Échéance"
                    name="echeance"
                    type="date"
                    value={formFinancement.echeance}
                    onChange={(e) => setFormFinancement({ ...formFinancement, echeance: e.target.value })}
                  />
                </div>
                <Field
                  label="Référence convention"
                  name="convention_ref"
                  value={formFinancement.convention_ref}
                  onChange={(e) => setFormFinancement({ ...formFinancement, convention_ref: e.target.value })}
                />
                <div>
                  <label style={labelStyle}>Statut</label>
                  <select
                    value={formFinancement.statut}
                    onChange={(e) => setFormFinancement({ ...formFinancement, statut: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModalFinancement(false)}
                  style={{ padding: "10px 20px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  style={{ padding: "10px 20px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer", opacity: envoi ? 0.7 : 1 }}
                >
                  {envoi ? "Enregistrement..." : financementEnCoursId ? "Enregistrer les modifications" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nouveau bailleur */}
      {showModalBailleur && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Nouveau bailleur</h2>
              <button onClick={() => setShowModalBailleur(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}>✕</button>
            </div>

            {erreur && (
              <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" }}>
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmitBailleur}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Field label="Nom *" name="nom" value={formBailleur.nom} onChange={(e) => setFormBailleur({ ...formBailleur, nom: e.target.value })} required />
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select
                    value={formBailleur.type}
                    onChange={(e) => setFormBailleur({ ...formBailleur, type: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Sélectionner</option>
                    <option value="institution">Institution publique</option>
                    <option value="fondation">Fondation</option>
                    <option value="agence">Agence de coopération</option>
                    <option value="entreprise">Entreprise privée</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <Field label="Pays" name="pays" value={formBailleur.pays} onChange={(e) => setFormBailleur({ ...formBailleur, pays: e.target.value })} />
                <Field label="Contact" name="contact" value={formBailleur.contact} onChange={(e) => setFormBailleur({ ...formBailleur, contact: e.target.value })} />
                <Field label="Email" name="email" type="email" value={formBailleur.email} onChange={(e) => setFormBailleur({ ...formBailleur, email: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModalBailleur(false)}
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