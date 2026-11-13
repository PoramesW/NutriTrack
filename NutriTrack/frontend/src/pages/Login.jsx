
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, TOKEN_KEY } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authApi.login(email.trim(), password);

      if (!result.token) {
        throw new Error("Login response did not contain a token");
      }

      localStorage.setItem(TOKEN_KEY, result.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="membership-page">
      <section className="membership-card">
        <Link to="/welcome" className="membership-brand">
          <span className="membership-brand-mark">N</span>
          <span>NutriTrack</span>
        </Link>

        <p className="membership-eyebrow">WELCOME BACK</p>
        <h1 className="membership-title">Login to your account</h1>
        <p className="membership-description">
          Continue your journey to a healthier you.
        </p>

        <form className="membership-form" onSubmit={handleSubmit}>
          <div className="membership-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="membership-field">
            <div className="membership-label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <div className="membership-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="membership-password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="membership-message membership-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="membership-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="membership-switch">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
}
