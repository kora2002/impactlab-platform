import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/beneficiaires", label: "Bénéficiaires", icon: "👥" },
  { path: "/programmes", label: "Programmes", icon: "📋" },
  { path: "/inscriptions", label: "Inscriptions", icon: "📝" },
];

const navBottom = [
  { path: "/financements", label: "Financements", icon: "💰" },
  { path: "/documents", label: "Documents", icon: "📁" },
];

export default function Sidebar() {
  const { deconnexion, utilisateur } = useAuth();

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoCircle}>IL</div>
        <div>
          <div style={styles.logoTitle}>Impact'Lab GDC</div>
          <div style={styles.logoSub}>CRM / M&E</div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>Menu principal</div>
        {navItems.map((item) => (
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
        {navBottom.map((item) => (
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

      {/* Utilisateur connecté */}
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
    background: "#fff",
    borderRight: "1px solid #f0f0f0",
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
    borderBottom: "1px solid #f0f0f0",
  },
  logoCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#1F4E5F",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  logoTitle: { fontWeight: "600", fontSize: "14px", color: "#1a1a1a" },
  logoSub: { fontSize: "11px", color: "#999" },
  nav: { flex: 1, padding: "1rem 0.75rem", overflowY: "auto" },
  navSection: {
    fontSize: "11px",
    color: "#aaa",
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
    color: "#555",
    fontSize: "13px",
    marginBottom: "2px",
    transition: "background 0.15s",
  },
  navItemActive: {
    background: "#EEF5F7",
    color: "#1F4E5F",
    fontWeight: "600",
  },
  userZone: {
    padding: "1rem",
    borderTop: "1px solid #f0f0f0",
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
    background: "#1F4E5F",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "13px",
    flexShrink: 0,
  },
  userName: { fontSize: "13px", fontWeight: "500", color: "#1a1a1a" },
  userRole: { fontSize: "11px", color: "#999", textTransform: "capitalize" },
  logoutBtn: {
    width: "100%",
    padding: "8px",
    background: "#FEF2F2",
    color: "#B91C1C",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center",
  },
};