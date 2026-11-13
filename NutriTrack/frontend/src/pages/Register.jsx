import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, TOKEN_KEY } from "../services/api";

function getPasswordError(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter (a-z).";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter (A-Z).";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number (0-9).";
  }

  return "";
}

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const passwordError = getPasswordError(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.register(
        name.trim(),
        email.trim(),
        password
      );

      if (!result.token) {
        throw new Error("Registration response did not contain a token");
      }

      localStorage.setItem(TOKEN_KEY, result.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="membership-page">
      <section className="membership-card">
        <div className="membership-brand">N</div>

        <p className="membership-eyebrow">NUTRITRACK ACCOUNT</p>
        <h1>Create Account</h1>
        <p className="membership-description">
          Create your account and start tracking your health.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="membership-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="membership-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="membership-field">
            <label htmlFor="password">Password</label>
            <div className="membership-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="membership-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <span className="membership-hint">
              At least 8 characters, including uppercase, lowercase, and a
              number.
            </span>
          </div>

          {error && (
            <p className="membership-message membership-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="membership-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}