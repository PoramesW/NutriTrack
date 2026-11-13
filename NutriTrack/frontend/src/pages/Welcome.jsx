
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <section className="welcome-card">
        <div className="welcome-brand">
          <span className="welcome-brand-mark">N</span>
          <span>NutriTrack</span>
        </div>

        <p className="welcome-eyebrow">
          YOUR HEALTH JOURNEY STARTS HERE
        </p>

        <h1>
          Take Control of
          <br />
          Your Health.
        </h1>

        <p className="welcome-description">
          Track your nutrition, monitor your progress,
          and build healthier habits with NutriTrack.
        </p>

        <div className="welcome-actions">
          <Link to="/login" className="food-primary-button">
            Login
          </Link>

          <Link to="/register" className="food-secondary-button">
            Create Account
          </Link>
        </div>

        <p className="welcome-footer">
          Your personal nutrition and fitness tracker.
        </p>
      </section>
    </main>
  );
}
