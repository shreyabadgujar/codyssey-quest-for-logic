import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ExpeditionAuth } from "../components/ExpeditionAuth.jsx";
import { login } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await login({ email, password });
      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpeditionAuth
      variant="login"
      title="Welcome Back, Explorer"
      introduction="Your expedition awaits. Continue uncovering the secrets of Codyssey."
      error={error}
      alternate={<>New explorer? <Link to="/register">Start a journal</Link></>}
    >
      <form className="entry-auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="explorer@codyssey.sea"
            required
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Your password"
            required
            disabled={loading}
          />
        </label>
        <button className="entry-button entry-button-gold" type="submit" disabled={loading}>
          {loading ? "Opening journal…" : "Sign In"}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </form>
    </ExpeditionAuth>
  );
}
