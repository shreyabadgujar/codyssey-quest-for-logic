import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { register } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
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

    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!username || !email || !password) {
      setError("Please fill in all journal details.");
      return;
    }

    if (username.length < 3) {
      setError("Explorer name must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await register({ username, email, password });
      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create journal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="folio max-w-md mx-auto">
      <h1 className="text-3xl">Start a New Journal</h1>
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
          Explorer name
          <input
            className="field"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder="e.g. Captain Nemo"
            required
            disabled={loading}
          />
        </label>
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            disabled={loading}
          />
        </label>
        <button
          className="btn-brass justify-center"
          type="submit"
          disabled={loading}
        >
          {loading ? "Inscribing Journal..." : "Create Journal"}
        </button>
      </form>
      <p className="annotation mt-4">Already sailing? <Link to="/login">Log in</Link></p>
    </section>
  );
}

