export default function Card({ children, style = {}, title, action }) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #f0f0f0",
          padding: "1.25rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          ...style,
        }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>
              {title}
            </span>
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }