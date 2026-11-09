import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
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
    <section className="folio max-w-md mx-auto">
      <h1 className="text-3xl">Return to Your Journal</h1>
      <hr className="rule-ornate" />
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 mb-4 text-sm text-oxblood border border-oxblood/40 bg-oxblood/10 rounded-sm font-body"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1">
          Email
          <input
            className="field"
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
        <label className="grid gap-1">
          Password
          <input
            className="field"
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
        <button className="btn-brass justify-center" type="submit" disabled={loading}>
          {loading ? "Opening journal..." : "Log in"}
        </button>
      </form>
      <p className="annotation mt-4">New explorer? <Link to="/register">Start a journal</Link></p>
    </section>
  );
}

