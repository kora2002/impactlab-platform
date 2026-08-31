import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Programmes() {
  const navigate = useNavigate();
  const [programmes, setProgrammes]             = useState([]);
  const [chargement, setChargement]             = useState(true);
  const [cohortesExterne, setCohortesExterne]   = useState([]);
  const [reportingExterne, setReportingExterne] = useState(null);
  const [structures, setStructures]             = useState([]);
  const [showSageo, setShowSageo]               = useState(false);
  const [showIgbs, setShowIgbs]                 = useState(false);
  const [showAssoPro, setShowAssoPro]           = useState(false);

  const charger = () => {
    setChargement(true);
    api.get("programmes/")
      .then((res) => setProgrammes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setChargement(false));
  };

  const chargerExterne = () => {
    api.get("sageo/cohortes/")
      .then((res) => setCohortesExterne(res.data.cohortes || []))
      .catch((err) => console.error(err));
    api.get("sageo/reporting/")
      .then((res) => setReportingExterne(res.data))
      .catch((err) => console.error(err));
    api.get("structures/?type=association")
      .then((res) => setStructures(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => { charger(); chargerExterne(); }, []);

  const typeColors = {
    incubation: { background: "#EEEDFE", color: "#26215C" },
    insertion:  { background: "#E1F5EE", color: "#04342C" },
    education:  { background: "#E6F1FB", color: "#042C53" },
    conseil:    { background: "#FAEEDA", color: "#412402" },
  };

  const cohortesIGBS  = cohortesExterne.filter(c => c.programme === "IGBS");
  const cohortesSAGEO = cohortesExterne.filter(c => c.programme === "SAGEO");

  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Programmes</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
            Gestion des programmes Impact'Lab GDC
          </p>
        </div>
        <button
          onClick={() => { charger(); chargerExterne(); }}
          style={{ padding: "8px 14px", background: "#042C53", color: "#fff", borderRadius: "8px", fontWeight: "600", fontSize: "13px", border: "none", cursor: "pointer" }}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* ── PROGRAMMES CRM ── */}
      {chargement ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Chargement...</div>
      ) : programmes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
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
                style={{ width: "100%", padding: "8px", background: "#f8f9fa", color: "#042C53", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "1px solid #e0e0e0", cursor: "pointer" }}
              >
                Voir le programme
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── PROGRAMMES EXTERNES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* ── IGBS ── */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <div
            onClick={() => setShowIgbs(!showIgbs)}
            style={{ padding: "1.25rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: showIgbs ? "#EFF6FF" : "#fff" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🌱</span>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#042C53" }}>IGBS</h3>
                <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "#EFF6FF", color: "#1E40AF" }}>
                  Pré-incubation
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                {cohortesIGBS.length} cohorte(s) — Green Business Studio
              </p>
            </div>
            <span style={{ fontSize: "18px", color: "#888" }}>{showIgbs ? "▲" : "▼"}</span>
          </div>

          {showIgbs && (
            <div style={{ padding: "0 1.25rem 1.25rem" }}>
              {reportingExterne?.global && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
                  <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#042C53" }}>{reportingExterne.global.entreprises}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>Entreprises</div>
                  </div>
                  <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#9D174D" }}>{reportingExterne.global.partFemmes}%</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>Femmes</div>
                  </div>
                  <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#0F6E56" }}>{reportingExterne.global.emplois}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>Emplois</div>
                  </div>
                </div>
              )}
              {cohortesIGBS.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune cohorte IGBS.</p>
              ) : (
                cohortesIGBS.map((c) => (
                  <div key={c.ref} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "600", fontSize: "13px" }}>{c.nom}</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                        background: c.statut === "active" ? "#ECFDF5" : "#FEF9EC",
                        color: c.statut === "active" ? "#065F46" : "#92400E",
                      }}>
                        {c.statutLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", display: "flex", gap: "12px" }}>
                      <span>👥 {c.effectif}/{c.effectifCible}</span>
                      <span>👩 {c.quotaFemmes}% femmes</span>
                      <span>📅 {c.dateDebut} → {c.dateFin}</span>
                    </div>
                    {c.focus && <div style={{ fontSize: "12px", color: "#0F6E56", marginTop: "4px" }}>🎯 {c.focus}</div>}
                  </div>
                ))
              )}
              {reportingExterne?.parcours?.find(p => p.code === "IGBS")?.kpis.map((kpi) => (
                <div key={kpi.cle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>{kpi.libelle}</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: kpi.atteint ? "#0F6E56" : "#B91C1C" }}>
                    {kpi.actuel}{kpi.unite} / {kpi.cible}{kpi.unite}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SAGEO ── */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <div
            onClick={() => setShowSageo(!showSageo)}
            style={{ padding: "1.25rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: showSageo ? "#ECFDF5" : "#fff" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🚀</span>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#042C53" }}>SAGEO</h3>
                <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "#ECFDF5", color: "#065F46" }}>
                  Incubation
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                {cohortesSAGEO.length} cohorte(s) — Accompagnement PME
              </p>
            </div>
            <span style={{ fontSize: "18px", color: "#888" }}>{showSageo ? "▲" : "▼"}</span>
          </div>

          {showSageo && (
            <div style={{ padding: "0 1.25rem 1.25rem" }}>
              {reportingExterne?.global && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
                  <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#042C53" }}>{reportingExterne.global.financementsMobilises}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>Financement (FCFA)</div>
                  </div>
                  <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#9D174D" }}>{reportingExterne.global.partFemmes}%</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>Femmes</div>
                  </div>
                  <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#0F6E56" }}>{reportingExterne.global.diagnosticsAboutis}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>Diagnostics</div>
                  </div>
                </div>
              )}
              {cohortesSAGEO.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune cohorte SAGEO.</p>
              ) : (
                cohortesSAGEO.map((c) => (
                  <div key={c.ref} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "600", fontSize: "13px" }}>{c.nom}</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                        background: c.statut === "active" ? "#ECFDF5" : "#FEF9EC",
                        color: c.statut === "active" ? "#065F46" : "#92400E",
                      }}>
                        {c.statutLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", display: "flex", gap: "12px" }}>
                      <span>👥 {c.effectif}/{c.effectifCible}</span>
                      <span>👩 {c.quotaFemmes}% femmes</span>
                      <span>📅 {c.dateDebut} → {c.dateFin}</span>
                    </div>
                    {c.focus && <div style={{ fontSize: "12px", color: "#0F6E56", marginTop: "4px" }}>🎯 {c.focus}</div>}
                  </div>
                ))
              )}
              {reportingExterne?.parcours?.find(p => p.code === "SAGEO")?.kpis.map((kpi) => (
                <div key={kpi.cle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>{kpi.libelle}</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: kpi.atteint ? "#0F6E56" : "#B91C1C" }}>
                    {kpi.actuel}{kpi.unite} / {kpi.cible}{kpi.unite}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ASSO-PRO ── */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <div
            onClick={() => setShowAssoPro(!showAssoPro)}
            style={{ padding: "1.25rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: showAssoPro ? "#FEF9EC" : "#fff" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🏢</span>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#042C53" }}>ASSO-PRO</h3>
                <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "#FEF9EC", color: "#92400E" }}>
                  Développement associatif
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                {structures.length} organisation(s) accompagnée(s)
              </p>
            </div>
            <span style={{ fontSize: "18px", color: "#888" }}>{showAssoPro ? "▲" : "▼"}</span>
          </div>

          {showAssoPro && (
            <div style={{ padding: "0 1.25rem 1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
                <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#042C53" }}>{structures.length}</div>
                  <div style={{ fontSize: "11px", color: "#888" }}>Organisations</div>
                </div>
                <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#0F6E56" }}>
                    {structures.filter(s => s.niveau_professionnalisation?.includes("Moyen") || s.niveau_professionnalisation?.includes("Élevé")).length}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888" }}>Niveau Moyen+</div>
                </div>
                <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#B91C1C" }}>
                    {structures.filter(s => s.niveau_professionnalisation?.includes("Faible")).length}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888" }}>Niveau Faible</div>
                </div>
              </div>

              {structures.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune organisation ASSO-PRO.</p>
              ) : (
                structures.slice(0, 5).map((st) => (
                  <div key={st.id} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px 12px", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "500", fontSize: "13px" }}>{st.nom}</span>
                    {st.niveau_professionnalisation ? (
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                        background: st.niveau_professionnalisation.includes("Élevé") ? "#ECFDF5" :
                                    st.niveau_professionnalisation.includes("Moyen") ? "#FEF9EC" : "#FEF2F2",
                        color: st.niveau_professionnalisation.includes("Élevé") ? "#065F46" :
                               st.niveau_professionnalisation.includes("Moyen") ? "#92400E" : "#B91C1C",
                      }}>
                        {st.niveau_professionnalisation.split("—")[1]?.trim() || st.niveau_professionnalisation}
                      </span>
                    ) : <span style={{ fontSize: "11px", color: "#aaa" }}>—</span>}
                  </div>
                ))
              )}
              {structures.length > 5 && (
                <p style={{ fontSize: "12px", color: "#888", textAlign: "center", marginTop: "8px" }}>
                  + {structures.length - 5} autre(s) organisation(s)
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} style={inputStyle} />
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "13px", fontWeight: "500", color: "#444", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", background: "#fafafa" };