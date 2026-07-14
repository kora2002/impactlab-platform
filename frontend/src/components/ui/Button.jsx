export default function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    size = "md",
    disabled = false,
    style = {},
  }) {
    const base = {
      borderRadius: "8px",
      fontWeight: "600",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "opacity 0.2s",
      border: "none",
      fontFamily: "inherit",
    };
  
    const variants = {
      primary: { background: "#1F4E5F", color: "#fff" },
      secondary: { background: "#f0f0f0", color: "#333" },
      danger: { background: "#FEF2F2", color: "#B91C1C" },
      success: { background: "#ECFDF5", color: "#065F46" },
    };
  
    const sizes = {
      sm: { padding: "6px 12px", fontSize: "12px" },
      md: { padding: "10px 18px", fontSize: "14px" },
      lg: { padding: "12px 24px", fontSize: "15px" },
    };
  
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, ...variants[variant], ...sizes[size], ...style }}
      >
        {children}
      </button>
    );
  }