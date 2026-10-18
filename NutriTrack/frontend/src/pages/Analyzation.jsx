
import { useMemo, useState } from "react";

const weeklyData = [
  { day: "Mon", calories: 1850, protein: 82 },
  { day: "Tue", calories: 2100, protein: 95 },
  { day: "Wed", calories: 1750, protein: 76 },
  { day: "Thu", calories: 1980, protein: 88 },
  { day: "Fri", calories: 2200, protein: 102 },
  { day: "Sat", calories: 1900, protein: 90 },
  { day: "Sun", calories: 1690, protein: 72 },
];

const weightData = [
  { day: "Week 1", weight: 67.2 },
  { day: "Week 2", weight: 66.8 },
  { day: "Week 3", weight: 66.5 },
  { day: "Week 4", weight: 66.1 },
];

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function Analyzation() {
  const [period, setPeriod] = useState("7");

  const calories = weeklyData.map((item) => item.calories);
  const proteins = weeklyData.map((item) => item.protein);

  const averageCalories = Math.round(average(calories));
  const averageProtein = Math.round(average(proteins));
  const highestCalories = Math.max(...calories);
  const lowestCalories = Math.min(...calories);

  const displayedData =
    period === "week" ? weeklyData : weeklyData.slice(-3);

  const maxCalories = Math.max(
    ...displayedData.map((item) => item.calories),
    2000
  );

  const minWeight = Math.min(...weightData.map((item) => item.weight));
  const maxWeight = Math.max(...weightData.map((item) => item.weight));
  const weightChange =
    weightData[weightData.length - 1].weight - weightData[0].weight;

  const filteredData = useMemo(() => {
  if (period === "lifetime") {
    return weeklyData;
  }

  const days = Number(period);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - days + 1);

  return weeklyData.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= today;
  });
}, [period, weeklyData]);

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
            onChange={(e) => setPeriod(e.target.value)}
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

      <div className="analysis-demo-notice">
        Demo data — these results are illustrative and are not connected
        to your saved food log yet.
      </div>

      <section className="analysis-summary-grid">
        <article className="analysis-stat-card">
          <span>Average daily calories</span>
          <strong>{averageCalories.toLocaleString()}</strong>
          <small>kcal per day</small>
        </article>

        <article className="analysis-stat-card">
          <span>Average protein</span>
          <strong>{averageProtein} g</strong>
          <small>per day</small>
        </article>

        <article className="analysis-stat-card">
          <span>Highest calorie day</span>
          <strong>{highestCalories.toLocaleString()}</strong>
          <small>kcal in the sample week</small>
        </article>

        <article className="analysis-stat-card">
          <span>Lowest calorie day</span>
          <strong>{lowestCalories.toLocaleString()}</strong>
          <small>kcal in the sample week</small>
        </article>
      </section>

      <section className="analysis-panel">
        <div className="analysis-panel-header">
          <div>
            <h2>Daily calorie intake</h2>
            <p>Compare daily intake with a reference goal of 2,000 kcal.</p>
          </div>
          <span className="analysis-legend">
            <i /> Calories
          </span>
        </div>

        <div className="calorie-chart">
          {displayedData.map((item) => (
            <div className="calorie-chart-column" key={item.day}>
              <span className="chart-value">
                {item.calories.toLocaleString()}
              </span>
              <div className="chart-bar-area">
                <div
                  className={`calorie-bar ${
                    item.calories > 2000 ? "over-goal" : ""
                  }`}
                  style={{
                    height: `${(item.calories / maxCalories) * 100}%`,
                  }}
                  title={`${item.calories} kcal`}
                />
                <div
                  className="chart-goal-line"
                  style={{ bottom: `${(2000 / maxCalories) * 100}%` }}
                />
              </div>
              <span className="chart-day">{item.day}</span>
            </div>
          ))}
        </div>

        <div className="analysis-chart-note">
          <span className="goal-line-key" />
          Reference goal: 2,000 kcal/day
        </div>
      </section>

      <section className="analysis-lower-grid">
        <article className="analysis-panel">
          <div className="analysis-panel-header">
            <div>
              <h2>Macronutrients</h2>
              <p>Average daily protein intake</p>
            </div>
          </div>

          <div className="protein-highlight">
            <span className="protein-icon">P</span>
            <div>
              <strong>{averageProtein} g/day</strong>
              <p>Average protein in the sample data</p>
            </div>
          </div>

          <div className="protein-list">
            {displayedData.map((item) => (
              <div className="protein-row" key={item.day}>
                <span>{item.day}</span>
                <div className="protein-track">
                  <div
                    className="protein-bar"
                    style={{ width: `${(item.protein / 120) * 100}%` }}
                  />
                </div>
                <strong>{item.protein} g</strong>
              </div>
            ))}
          </div>

          <p className="analysis-footnote">
            Protein needs vary with body size, activity, and individual goals.
          </p>
        </article>

        <article className="analysis-panel">
          <div className="analysis-panel-header">
            <div>
              <h2>Weight progress</h2>
              <p>Illustrative monthly measurements</p>
            </div>
          </div>

          <div className="weight-summary">
            <div>
              <span>Latest sample weight</span>
              <strong>
                {weightData[weightData.length - 1].weight.toFixed(1)} kg
              </strong>
            </div>
            <span
              className={`weight-change ${
                weightChange < 0 ? "weight-down" : ""
              }`}
            >
              {weightChange > 0 ? "+" : ""}
              {weightChange.toFixed(1)} kg
            </span>
          </div>

          <div className="weight-chart">
            {weightData.map((item) => {
              const range = maxWeight - minWeight || 1;
              const height = 35 + ((item.weight - minWeight) / range) * 55;

              return (
                <div className="weight-chart-column" key={item.day}>
                  <strong>{item.weight.toFixed(1)}</strong>
                  <div className="weight-bar-area">
                    <div
                      className="weight-bar"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span>{item.day}</span>
                </div>
              );
            })}
          </div>

          <p className="analysis-footnote">
            Weight change alone does not determine health or fitness progress.
          </p>
        </article>
      </section>

      <section className="analysis-panel insights-panel">
        <div className="analysis-panel-header">
          <div>
            <h2>Insights</h2>
            <p>Observations from the current sample dataset</p>
          </div>
        </div>

        <div className="insight-item">
          <span className="insight-symbol">↗</span>
          <div>
            <strong>Calorie intake varies across days</strong>
            <p>
              The sample ranges from {lowestCalories.toLocaleString()} to{" "}
              {highestCalories.toLocaleString()} kcal per day. A consistent
              logging routine makes trends easier to understand.
            </p>
          </div>
        </div>

        <div className="insight-item">
          <span className="insight-symbol">P</span>
          <div>
            <strong>Review protein against your personal needs</strong>
            <p>
              The sample average is {averageProtein} g per day. Compare your
              intake with a target appropriate for your body and activity level.
            </p>
          </div>
        </div>

        <div className="insight-item">
          <span className="insight-symbol">⚖</span>
          <div>
            <strong>Track weight under consistent conditions</strong>
            <p>
              Weighing at a similar time and under similar conditions can
              help distinguish longer-term trends from normal daily changes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
