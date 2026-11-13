import { useEffect, useState } from "react";
import { analyzationApi } from "../services/api";

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Analyzation() {
  const [period, setPeriod] = useState("7");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalysis(selectedPeriod = period) {
    try {
      setLoading(true);
      setError("");

      const response = await analyzationApi.get(selectedPeriod);
      setData(response.data);
    } catch (err) {
      setError(err.message || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalysis(period);
  }, [period]);

  if (loading) {
    return <div className="analysis-page">Loading analysis...</div>;
  }

  if (error) {
    return (
      <div className="analysis-page">
        <p role="alert">{error}</p>
        <button
          className="primary-button"
          onClick={() => loadAnalysis(period)}
        >
          Retry
        </button>
      </div>
    );
  }

  const dailyData = data?.dailyData || [];
  const weightData = data?.weightData || [];
  const averages = data?.averages || {
    calories: 0,
    protein: 0,
  };
  const goals = data?.goals;

  const averageCalories = Math.round(averages.calories);
  const averageProtein = Math.round(averages.protein);

  const highestCalories = data?.highestCalories || 0;
  const lowestCalories = data?.lowestCalories || 0;

  const maxCalories = Math.max(
    ...dailyData.map((item) => item.calories),
    goals?.calories || 0,
    1
  );

  const weights = weightData.map((item) => item.weight);
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;

  const weightChange =
    weights.length >= 2
      ? weights[weights.length - 1] - weights[0]
      : 0;

  const hasFoodData = dailyData.length > 0;
  const hasWeightData = weightData.length > 0;

  return (
    <div className="analysis-page">
      <header className="analysis-header">
        <div>
          <p className="eyebrow">YOUR PROGRESS</p>
          <h1>Analyzation</h1>
          <p className="analysis-description">
            Understand your nutrition habits and track your progress.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="analysis-period-select"
        >
          <option value="lifetime">Lifetime</option>
          <option value="365">Last 365 days</option>
          <option value="90">Last 90 days</option>
          <option value="28">Last 28 days</option>
          <option value="7">Last 7 days</option>
          <option value="1">Last 1 day</option>
        </select>
      </header>

      <section className="analysis-summary-grid">
        <article className="analysis-stat-card">
          <span>Average daily calories</span>
          <strong>
            {hasFoodData ? averageCalories.toLocaleString() : "—"}
          </strong>
          <small>kcal per logged day</small>
        </article>

        <article className="analysis-stat-card">
          <span>Average protein</span>
          <strong>{hasFoodData ? `${averageProtein} g` : "—"}</strong>
          <small>per logged day</small>
        </article>

        <article className="analysis-stat-card">
          <span>Highest calorie day</span>
          <strong>
            {hasFoodData ? highestCalories.toLocaleString() : "—"}
          </strong>
          <small>kcal</small>
        </article>

        <article className="analysis-stat-card">
          <span>Lowest calorie day</span>
          <strong>
            {hasFoodData ? lowestCalories.toLocaleString() : "—"}
          </strong>
          <small>kcal</small>
        </article>
      </section>

      <section className="analysis-panel">
        <div className="analysis-panel-header">
          <div>
            <h2>Daily calorie intake</h2>
            <p>
              {goals
                ? `Compare daily intake with your goal of ${goals.calories.toLocaleString()} kcal.`
                : "Your daily calorie intake from saved food logs."}
            </p>
          </div>
          <span className="analysis-legend">
            <i /> Calories
          </span>
        </div>

        {!hasFoodData ? (
          <div className="empty-state">
            <p>No nutrition data for this period.</p>
            <span>Start logging meals to see your analysis.</span>
          </div>
        ) : (
          <>
            <div className="calorie-chart">
              {dailyData.map((item) => (
                <div className="calorie-chart-column" key={item.date}>
                  <span className="chart-value">
                    {Math.round(item.calories).toLocaleString()}
                  </span>
                  <div className="chart-bar-area">
                    <div
                      className={`calorie-bar ${
                        goals && item.calories > goals.calories
                          ? "over-goal"
                          : ""
                      }`}
                      style={{
                        height: `${(item.calories / maxCalories) * 100}%`,
                      }}
                      title={`${item.calories} kcal`}
                    />

                    {goals && (
                      <div
                        className="chart-goal-line"
                        style={{
                          bottom: `${(goals.calories / maxCalories) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                  <span className="chart-day">
                    {formatDate(item.date)}
                  </span>
                </div>
              ))}
            </div>

            {goals && (
              <div className="analysis-chart-note">
                <span className="goal-line-key" />
                Your goal: {goals.calories.toLocaleString()} kcal/day
              </div>
            )}
          </>
        )}
      </section>

      <section className="analysis-lower-grid">
        <article className="analysis-panel">
          <div className="analysis-panel-header">
            <div>
              <h2>Macronutrients</h2>
              <p>Average daily protein intake</p>
            </div>
          </div>

          {hasFoodData ? (
            <>
              <div className="protein-highlight">
                <span className="protein-icon">P</span>
                <div>
                  <strong>{averageProtein} g/day</strong>
                  <p>Average protein from logged days</p>
                </div>
              </div>

              <div className="protein-list">
                {dailyData.map((item) => (
                  <div className="protein-row" key={item.date}>
                    <span>{formatDate(item.date)}</span>
                    <div className="protein-track">
                      <div
                        className="protein-bar"
                        style={{
                          width: `${Math.min(
                            (item.protein /
                              Math.max(goals?.protein || 120, 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <strong>{Math.round(item.protein)} g</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No nutrition data available.</p>
            </div>
          )}

          <p className="analysis-footnote">
            Protein needs vary with body size, activity, and individual goals.
          </p>
        </article>

        <article className="analysis-panel">
          <div className="analysis-panel-header">
            <div>
              <h2>Weight progress</h2>
              <p>Recorded body weight measurements</p>
            </div>
          </div>

          {hasWeightData ? (
            <>
              <div className="weight-summary">
                <div>
                  <span>Latest recorded weight</span>
                  <strong>
                    {weights[weights.length - 1].toFixed(1)} kg
                  </strong>
                </div>

                {weights.length >= 2 && (
                  <span
                    className={`weight-change ${
                      weightChange < 0 ? "weight-down" : ""
                    }`}
                  >
                    {weightChange > 0 ? "+" : ""}
                    {weightChange.toFixed(1)} kg
                  </span>
                )}
              </div>

              <div className="weight-chart">
                {weightData.map((item, index) => {
                  const range = maxWeight - minWeight || 1;
                  const height =
                    35 + ((item.weight - minWeight) / range) * 55;

                  return (
                    <div
                      className="weight-chart-column"
                      key={`${item.date}-${index}`}
                    >
                      <strong>{item.weight.toFixed(1)}</strong>
                      <div className="weight-bar-area">
                        <div
                          className="weight-bar"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span>
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No weight records for this period.</p>
              <span>Update your weight from Dashboard.</span>
            </div>
          )}

          <p className="analysis-footnote">
            Weight change alone does not determine health or fitness progress.
          </p>
        </article>
      </section>

      <section className="analysis-panel insights-panel">
        <div className="analysis-panel-header">
          <div>
            <h2>Insights</h2>
            <p>Observations from your saved records</p>
          </div>
        </div>

        {!hasFoodData && !hasWeightData ? (
          <div className="empty-state">
            <p>No records available for analysis.</p>
            <span>Log meals or record your weight to get started.</span>
          </div>
        ) : (
          <>
            {hasFoodData && (
              <>
                <div className="insight-item">
                  <span className="insight-symbol">↗</span>
                  <div>
                    <strong>Calorie intake</strong>
                    <p>
                      Your recorded intake ranges from{" "}
                      {lowestCalories.toLocaleString()} to{" "}
                      {highestCalories.toLocaleString()} kcal per day.
                    </p>
                  </div>
                </div>

                <div className="insight-item">
                  <span className="insight-symbol">P</span>
                  <div>
                    <strong>Protein intake</strong>
                    <p>
                      Your average protein intake is {averageProtein} g per
                      logged day.
                      {goals
                        ? ` Your daily goal is ${goals.protein} g.`
                        : " No personal protein goal has been set."}
                    </p>
                  </div>
                </div>
              </>
            )}

            {hasWeightData && (
              <div className="insight-item">
                <span className="insight-symbol">⚖</span>
                <div>
                  <strong>Weight progress</strong>
                  <p>
                    {weights.length >= 2
                      ? `Your recorded weight changed by ${
                          weightChange > 0 ? "+" : ""
                        }${weightChange.toFixed(1)} kg during this period.`
                      : "You have one recorded weight measurement in this period."}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}