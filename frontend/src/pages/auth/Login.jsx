import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { connexion } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(form.username, form.password);

      connexion(data);

      navigate("/");
    } catch (err) {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="logo">
          <div className="logo-circle">IL</div>

          <div>
            <h2>Impact'Lab GDC</h2>
            <p>Plateforme de Suivi & Évaluation</p>
          </div>
        </div>

        <h1>Connexion</h1>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Nom d'utilisateur</label>

            <input
              type="text"
              name="username"
              placeholder="admin"
              value={form.username}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>Mot de passe</label>

            <input
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              required
            />

          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

        </form>

      </div>

    </div>
  );
}