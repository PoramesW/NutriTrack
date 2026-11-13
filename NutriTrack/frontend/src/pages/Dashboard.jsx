import { useEffect, useState } from "react";
import { dashboardApi } from "../services/api";

const emptyTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);

  async function loadDashboard() {
    try {
      setError("");
      const response = await dashboardApi.get();
      setData(response.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function saveWeight(event) {
    event.preventDefault();

    const value = Number(weightInput);

    if (!Number.isFinite(value) || value < 20 || value > 350) {
      setError("Weight must be between 20 and 350 kg");
      return;
    }

    try {
      setSavingWeight(true);
      setError("");
      await dashboardApi.updateWeight(value);
      setShowWeightForm(false);
      setWeightInput("");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to save weight");
    } finally {
      setSavingWeight(false);
    }
  }

  if (loading) {
    return <div className="dashboard-page">Loading dashboard...</div>;
  }

  if (error && !data) {
    return (
      <div className="dashboard-page">
        <p role="alert">{error}</p>
        <button className="primary-button" onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const foods = data?.foods || [];
  const totals = data?.totals || emptyTotals;
  const goals = data?.goals;
  const weight = data?.weight;

  const caloriePercent =
    goals?.calories > 0
      ? Math.min((totals.calories / goals.calories) * 100, 100)
      : 0;

  const nutrients = [
    {
      name: "Protein",
      amount: totals.protein,
      goal: goals?.protein,
      color: "protein",
    },
    {
      name: "Carbohydrates",
      amount: totals.carbs,
      goal: goals?.carbs,
      color: "carbs",
    },
    {
      name: "Fat",
      amount: totals.fat,
      goal: goals?.fat,
      color: "fat",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">YOUR HEALTH OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="page-description">
            Track your nutrition and daily progress.
          </p>
        </div>
      </header>

      {error && <p role="alert">{error}</p>}

      <section className="summary-grid">
        <article className="summary-card calorie-card">
          <div className="card-topline">
            <span className="card-label">Calories consumed</span>
            <span className="metric-icon">⚡</span>
          </div>
          <p className="metric-value">
            {Math.round(totals.calories).toLocaleString()}
            <span> kcal</span>
          </p>

          <p className="metric-subtext">
            {goals
              ? `of ${goals.calories.toLocaleString()} kcal daily goal`
              : "Daily calorie goal not set"}
          </p>

          {goals && (
            <>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Daily calorie goal"
                aria-valuenow={Math.round(caloriePercent)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
              <p className="remaining-text">
                {Math.max(
                  goals.calories - totals.calories,
                  0
                ).toLocaleString()}{" "}
                kcal remaining
              </p>
            </>
          )}
        </article>

        <article className="summary-card">
          <div className="card-topline">
            <span className="card-label">Current weight</span>
            <span className="metric-icon">⚖</span>
          </div>
          <p className="metric-value">
            {weight ? weight.weight : "—"}
            {weight && <span> kg</span>}
          </p>
          <p className="metric-subtext">
            {weight ? "Latest recorded weight" : "No weight recorded"}
          </p>

          <button
            className="text-button"
            onClick={() => setShowWeightForm((visible) => !visible)}
          >
            {showWeightForm ? "Cancel" : "Update weight"}
          </button>

          {showWeightForm && (
            <form className="weight-form" onSubmit={saveWeight}>
              <label htmlFor="weight-input">Weight (kg)</label>
              <input
                id="weight-input"
                type="number"
                min="20"
                max="350"
                step="0.1"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
                required
              />
              <button
                type="submit"
                className="primary-button"
                disabled={savingWeight}
              >
                {savingWeight ? "Saving..." : "Save"}
              </button>
            </form>
          )}
        </article>

        <article className="summary-card">
          <div className="card-topline">
            <span className="card-label">Protein</span>
            <span className="metric-icon">●</span>
          </div>
          <p className="metric-value">
            {Number(totals.protein.toFixed(1))}
            <span> g</span>
          </p>
          <p className="metric-subtext">From today's food log</p>
        </article>

        <article className="summary-card">
          <div className="card-topline">
            <span className="card-label">Carbohydrates</span>
            <span className="metric-icon">◉</span>
          </div>
          <p className="metric-value">
            {Number(totals.carbs.toFixed(1))}
            <span> g</span>
          </p>
          <p className="metric-subtext">From today's food log</p>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Today's nutrition</h2>
              <p>Macronutrients from logged meals</p>
            </div>
          </div>

          {nutrients.map((item) => {
            const percent =
              item.goal > 0
                ? Math.min((item.amount / item.goal) * 100, 100)
                : 0;

            return (
              <div className="nutrient-row" key={item.name}>
                <div className="nutrient-heading">
                  <span>{item.name}</span>
                  <strong>
                    {Number(item.amount.toFixed(1))} g
                    {item.goal > 0
                      ? ` / ${item.goal} g`
                      : " · No goal set"}
                  </strong>
                </div>

                {item.goal > 0 && (
                  <div className="nutrient-track">
                    <div
                      className={`nutrient-fill ${item.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {!goals && (
            <p className="panel-note">
              Nutrition goals have not been set.
            </p>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Today's food log</h2>
              <p>{foods.length} food entries</p>
            </div>
          </div>

          {foods.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <p>No food entries yet.</p>
              <span>Your food log is currently empty.</span>
            </div>
          ) : (
            <div className="meal-list">
              {foods.map((item) => (
                <div className="meal-row" key={item.id}>
                  <div className="meal-symbol">🍴</div>
                  <div className="meal-info">
                    <strong>{item.name}</strong>
                    <span>
                      {item.meal} · P {item.protein}g · C {item.carbs}g · F{" "}
                      {item.fat}g
                    </span>
                  </div>
                  <div className="meal-calories">
                    <strong>{Math.round(item.calories)}</strong>
                    <span>kcal</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}