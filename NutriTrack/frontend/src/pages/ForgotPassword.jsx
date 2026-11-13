
import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetLink("");
    setLoading(true);

    try {
      const result = await authApi.forgotPassword(email.trim());
      setMessage(result.message);

      if (result.resetLink) {
        setResetLink(result.resetLink);
      }
    } catch (err) {
      setError(err.message || "Unable to request password reset");
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

        <p className="membership-eyebrow">ACCOUNT RECOVERY</p>
        <h1 className="membership-title">Forgot your password?</h1>
        <p className="membership-description">
          Enter the email address associated with your account. We'll help you
          reset your password.
        </p>

        <form className="membership-form" onSubmit={handleSubmit}>
          <div className="membership-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
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

          {resetLink && (
            <div className="membership-demo-link">
              <strong>Demo Mode</strong>
              <p>Password reset link generated successfully.</p>
              <a href={resetLink}>Continue to Reset Password</a>
            </div>
          )}

          <button
            className="membership-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Send Reset Link"}
          </button>
        </form>

        <p className="membership-switch">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}
