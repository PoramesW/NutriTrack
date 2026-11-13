import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset link is invalid or missing its token.");
      return;
    }

    const passwordError = getPasswordError(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.resetPassword(token, password);
      setMessage(result.message);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || "Unable to reset password");
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

        <p className="membership-eyebrow">SECURE YOUR ACCOUNT</p>
        <h1 className="membership-title">Reset password</h1>
        <p className="membership-description">
          Create a new password for your NutriTrack account.
        </p>

        <form className="membership-form" onSubmit={handleSubmit}>
          <div className="membership-field">
            <label htmlFor="password">New Password</label>
            <div className="membership-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
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
            <span className="membership-hint">
              At least 8 characters, including uppercase, lowercase, and a
              number.
            </span>
          </div>

          <div className="membership-field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="membership-password-wrap">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your new password again"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                className="membership-password-toggle"
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="membership-message membership-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="membership-message membership-success" role="status">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="membership-switch">
          <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}