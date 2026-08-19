import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// ─── Navigation avec permissions par rôle ─────────────────────────────────────

const navItems = [
  { path: "/",             label: "Dashboard",       icon: "📊", roles: ["direction", "merl"] },
  { path: "/beneficiaires",label: "Bénéficiaires",   icon: "👥", roles: ["direction", "merl", "responsable", "terrain"] },
  { path: "/programmes",   label: "Programmes",      icon: "📋", roles: ["direction", "merl", "responsable", "terrain"] },
  { path: "/inscriptions", label: "Inscriptions",    icon: "📝", roles: ["direction", "merl", "responsable", "terrain"] },
  { path: "/suivi",        label: "Suivi Insertion", icon: "📈", roles: ["direction", "merl"] },
  { path: "/structures",   label: "Structures",      icon: "🏢", roles: ["direction", "merl", "terrain"] },
];

const navBottom = [
  { path: "/financements", label: "Financements", icon: "💰", roles: ["direction", "finances"] },
  { path: "/documents",    label: "Documents",    icon: "📁", roles: ["direction", "merl", "responsable", "terrain", "finances"] },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { deconnexion, utilisateur } = useAuth();
  const role = utilisateur?.role || "";

  return (
    <aside style={styles.sidebar}>

      {/* ── Logo ── */}
      <div style={styles.logo}>
        <div style={styles.logoCircle}>IL</div>
        <div>
          <div style={styles.logoTitle}>Impact'Lab GDC</div>
          <div style={styles.logoSub}>CRM / M&E</div>
        </div>
      </div>

      {/* ── Navigation principale ── */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>Menu principal</div>
        {navItems.filter(item => item.roles.includes(role)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ ...styles.navSection, marginTop: "1.5rem" }}>Gestion</div>
        {navBottom.filter(item => item.roles.includes(role)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Utilisateur connecté ── */}
      <div style={styles.userZone}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {utilisateur?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={styles.userName}>{utilisateur?.username}</div>
            <div style={styles.userRole}>{utilisateur?.role}</div>
          </div>
        </div>
        <button onClick={deconnexion} style={styles.logoutBtn}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "230px",
    background: "#042C53",
    borderRight: "none",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    flexShrink: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "1.25rem 1rem",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#0F6E56",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  logoTitle: { fontWeight: "600", fontSize: "14px", color: "#ffffff" },
  logoSub:   { fontSize: "11px", color: "rgba(255,255,255,0.6)" },
  nav:       { flex: 1, padding: "1rem 0.75rem", overflowY: "auto" },
  navSection: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0 0.25rem",
    marginBottom: "6px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 12px",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "13px",
    marginBottom: "2px",
    transition: "background 0.15s",
    textDecoration: "none",
  },
  navItemActive: {
    background: "#0F6E56",
    color: "#ffffff",
    fontWeight: "600",
  },
  userZone: {
    padding: "1rem",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#0F6E56",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "13px",
    flexShrink: 0,
  },
  userName:  { fontSize: "13px", fontWeight: "500", color: "#ffffff" },
  userRole:  { fontSize: "11px", color: "rgba(255,255,255,0.6)", textTransform: "capitalize" },
  logoutBtn: {
    width: "100%",
    padding: "8px",
    background: "rgba(255,255,255,0.1)",
    color: "#ffffff",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
  },
};