import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Feather } from "lucide-react";
import { ExpeditionAuth } from "../components/ExpeditionAuth.jsx";
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
    <ExpeditionAuth
      variant="register"
      title="Begin Your Expedition"
      introduction="Every great explorer starts with a single step. Create your identity and enter the world of Codyssey."
      error={error}
      alternate={<>Already sailing? <Link to="/login">Sign in</Link></>}
    >
      <form className="entry-auth-form" onSubmit={handleSubmit}>
        <label>
          Explorer name
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder="e.g. Captain Nemo"
            required
            disabled={loading}
          />
        </label>
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            disabled={loading}
          />
        </label>
        <button className="entry-button entry-button-gold" type="submit" disabled={loading}>
          {loading ? "Inscribing journal…" : "Create Journal"}
          <Feather size={17} aria-hidden="true" />
        </button>
      </form>
    </ExpeditionAuth>
  );
}
