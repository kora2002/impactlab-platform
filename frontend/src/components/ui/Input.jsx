export default function Input({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    required = false,
    style = {},
  }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {label && (
          <label style={{ fontSize: "13px", fontWeight: "500", color: "#444" }}>
            {label}
          </label>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1.5px solid #e0e0e0",
            fontSize: "14px",
            background: "#fafafa",
            ...style,
          }}
        />
      </div>
    );
  }