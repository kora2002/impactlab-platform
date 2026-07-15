import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function DetailInscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inscription, setInscription] = useState(null);
  const [chargement, setChargement]   = useState(true);
  const [succes, setSucces]           = useState("");
  const [erreur, setErreur]           = useState("");

  const charger = () => {
    setChargement(true);
    api.get(`inscriptions/${id}/`)
      .then((res) => setInscription(res.data))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [id]);

  // ── Valider ou rejeter ──
  const handleValider = (action) => {
    const motif = action === "rejeter"
      ? window.prompt("Motif du rejet :")
      : null;
    if (action === "rejeter" && motif === null) return;

    const token = localStorage.getItem("access");
    fetch(`http://localhost:8000/api/inscriptions/${id}/valider/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, motif_rejet: motif || "" }),
    })
      .then((res) => res.json())
      .then(() => {
        setSucces(action === "valider" ? "Inscription validée." : "Inscription rejetée.");
        charger();
      })
      .catch(() => setErreur("Erreur lors de la validation."));
  };

  // ── Avancer à l'étape suivante ──
  const handleAvancer = (etapeId) => {
    const token = localStorage.getItem("access");
    fetch(`http://localhost:8000/api/inscriptions/${id}/avancer/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ etape_id: etapeId }),
    })
      .then(() => {
        setSucces("Étape avancée avec succès.");
        charger();
      })
      .catch(() => setErreur("Erreur lors de l'avancement."));
  };

  // ── Abandonner ──
  const handleAbandonner = () => {
    const motif = window.prompt("Motif de l'abandon :");
    if (!motif) return;
    const token = localStorage.getItem("access");
    fetch(`http://localhost:8000/api/inscriptions/${id}/abandonner/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ motif }),
    })
      .then(() => {
        setSucces("Abandon enregistré.");
        charger();
      })
      .catch(() => setErreur("Erreur lors de l'abandon."));
  };

  if (chargement) return <div style={{ padding: "2rem", color: "#888" }}>Chargement...</div>;
  if (!inscription) return <div style={{ padding: "2rem", color: "#888" }}>Inscription introuvable.</div>;

  const statutColors = {
    en_attente: { background: "#FEF9EC", color: "#92400E" },
    validee:    { background: "#ECFDF5", color: "#065F46" },
    rejetee:    { background: "#FEF2F2", color: "#B91C1C" },
  };

  const progressionColors = {
    en_cours:         { background: "#E6F1FB", color: "#042C53" },
    termine:          { background: "#ECFDF5", color: "#065F46" },
    abandonne:        { background: "#FEF2F2", color: "#B91C1C" },
    en_attente_valid: { background: "#FEF9EC", color: "#92400E" },
  };

  return (
    <div>
      {/* En-tête */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate("/inscriptions")} style={s.btnSecondary}>
            ← Retour
          </button>
          <div>
            <h1 style={s.titre}>Inscription #{inscription.id}</h1>
            <p style={s.sousTitre}>{inscription.beneficiaire_nom} — {inscription.programme_nom}</p>
          </div>
        </div>
        <span style={{ ...s.badge, ...(statutColors[inscription.statut] || {}) }}>
          {inscription.statut_display}
        </span>
      </div>

      {/* Messages */}
      {succes && <div style={s.alertSuccess}>✅ {succes}</div>}
      {erreur && <div style={s.alertError}>❌ {erreur}</div>}

      <div style={s.grid2}>

        {/* Informations */}
        <div style={s.card}>
          <div style={s.cardTitle}>Informations</div>
          <InfoRow label="Bénéficiaire"       value={inscription.beneficiaire_nom} />
          <InfoRow label="Programme"          value={inscription.programme_nom} />
          <InfoRow label="Cohorte"            value={inscription.cohorte_nom} />
          <InfoRow label="Date d'inscription" value={new Date(inscription.date_inscription).toLocaleDateString("fr-FR")} />
          <InfoRow label="Statut"             value={inscription.statut_display} />
          {inscription.date_validation && (
            <InfoRow label="Date de validation" value={new Date(inscription.date_validation).toLocaleDateString("fr-FR")} />
          )}
          {inscription.motif_rejet && (
            <InfoRow label="Motif de rejet" value={inscription.motif_rejet} />
          )}
        </div>

        {/* Actions */}
        <div style={s.card}>
          <div style={s.cardTitle}>Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Valider / Rejeter */}
            {inscription.statut === "en_attente" && (
              <>
                <button
                  onClick={() => handleValider("valider")}
                  style={{ ...s.btnAction, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}
                >
                  ✅ Valider l'inscription
                </button>
                <button
                  onClick={() => handleValider("rejeter")}
                  style={{ ...s.btnAction, background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}
                >
                  ❌ Rejeter l'inscription
                </button>
              </>
            )}

            {/* Avancer à l'étape suivante */}
            {inscription.statut === "validee" && inscription.progressions?.length > 0 && (() => {
              const enCours = inscription.progressions.find((p) => p.statut === "en_cours");
              const prochaine = inscription.progressions.find(
                (p) => enCours && p.etape_ordre === enCours.etape_ordre + 1
              );
              return prochaine ? (
                <button
                  onClick={() => handleAvancer(prochaine.etape)}
                  style={{ ...s.btnAction, background: "#E6F1FB", color: "#042C53", border: "1px solid #BFDBFE" }}
                >
                  ➡ Passer à : {prochaine.etape_nom}
                </button>
              ) : null;
            })()}

            {/* Abandonner */}
            {inscription.statut === "validee" && (
              <button
                onClick={handleAbandonner}
                style={{ ...s.btnAction, background: "#FEF9EC", color: "#92400E", border: "1px solid #FDE68A" }}
              >
                ⚠ Enregistrer un abandon
              </button>
            )}
          </div>
        </div>

        {/* Progressions */}
        <div style={{ ...s.card, gridColumn: "1 / -1" }}>
          <div style={s.cardTitle}>Parcours ({inscription.progressions?.length} étape(s))</div>
          {inscription.progressions?.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune progression enregistrée.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {inscription.progressions?.map((p) => (
                <div key={p.id} style={s.progressionItem}>
                  <div style={{ ...s.progressionNumero, ...(progressionColors[p.statut] || {}) }}>
                    {p.etape_ordre}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{p.etape_nom}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      Entrée : {new Date(p.date_entree).toLocaleDateString("fr-FR")}
                      {p.date_sortie && ` — Sortie : ${new Date(p.date_sortie).toLocaleDateString("fr-FR")}`}
                    </div>
                    {p.commentaire && <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{p.commentaire}</div>}
                  </div>
                  <span style={{ ...s.badge, ...(progressionColors[p.statut] || {}) }}>
                    {p.statut_display}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
      <span style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: "500" }}>{value}</span>
    </div>
  );
}

const s = {
  header:           { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  titre:            { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  sousTitre:        { fontSize: "13px", color: "#888" },
  grid2:            { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  card:             { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #f0f0f0" },
  cardTitle:        { fontWeight: "600", fontSize: "14px", color: "#1a1a1a", marginBottom: "1rem" },
  badge:            { padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  btnPrimary:       { padding: "10px 18px", background: "#1F4E5F", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer" },
  btnSecondary:     { padding: "8px 14px", background: "#f0f0f0", color: "#333", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" },
  btnAction:        { width: "100%", padding: "12px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", textAlign: "left" },
  alertSuccess:     { background: "#ECFDF5", color: "#065F46", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  alertError:       { background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "13px" },
  progressionItem:  { display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "8px" },
  progressionNumero:{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0 },
};