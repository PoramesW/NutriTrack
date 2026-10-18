
import { useState } from "react";

const initialMeals = [
  {
    id: 1,
    name: "ข้าวกะเพราไก่",
    meal: "Lunch",
    calories: 550,
    protein: 30,
    carbs: 65,
    fat: 16,
  },
  {
    id: 2,
    name: "อกไก่ต้ม",
    meal: "Dinner",
    calories: 220,
    protein: 42,
    carbs: 0,
    fat: 5,
  },
];

export default function Dashboard() {
  const [meals, setMeals] = useState(initialMeals);
  const [weight, setWeight] = useState(65);
  const [weightInput, setWeightInput] = useState("65");
  const [showWeightForm, setShowWeightForm] = useState(false);

  const calorieGoal = 2000;
  const totalCalories = meals.reduce(
    (sum, item) => sum + item.calories,
    0
  );
  const totalProtein = meals.reduce(
    (sum, item) => sum + item.protein,
    0
  );
  const totalCarbs = meals.reduce(
    (sum, item) => sum + item.carbs,
    0
  );
  const totalFat = meals.reduce(
    (sum, item) => sum + item.fat,
    0
  );

  const caloriePercent = Math.min(
    (totalCalories / calorieGoal) * 100,
    100
  );

  function saveWeight(event) {
    event.preventDefault();
    const value = Number(weightInput);

    if (Number.isFinite(value) && value >= 20 && value <= 350) {
      setWeight(value);
      setShowWeightForm(false);
    }
  }

  function removeMeal(id) {
    setMeals((current) =>
      current.filter((item) => item.id !== id)
    );
  }

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
        <span className="demo-badge">Demo data</span>
      </header>

      <section className="summary-grid">
        <article className="summary-card calorie-card">
          <div className="card-topline">
            <span className="card-label">Calories consumed</span>
            <span className="metric-icon">⚡</span>
          </div>
          <p className="metric-value">
            {totalCalories.toLocaleString()}
            <span> kcal</span>
          </p>
          <p className="metric-subtext">
            of {calorieGoal.toLocaleString()} kcal daily goal
          </p>
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
            {Math.max(calorieGoal - totalCalories, 0).toLocaleString()} kcal
            remaining
          </p>
        </article>

        <article className="summary-card">
          <div className="card-topline">
            <span className="card-label">Current weight</span>
            <span className="metric-icon">⚖</span>
          </div>
          <p className="metric-value">
            {weight}
            <span> kg</span>
          </p>
          <p className="metric-subtext">
            Latest manually entered weight
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
              <button type="submit" className="primary-button">
                Save
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
            {totalProtein}
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
            {totalCarbs}
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

          {[
            {
              name: "Protein",
              amount: totalProtein,
              color: "protein",
              percent: Math.min((totalProtein / 100) * 100, 100),
            },
            {
              name: "Carbohydrates",
              amount: totalCarbs,
              color: "carbs",
              percent: Math.min((totalCarbs / 250) * 100, 100),
            },
            {
              name: "Fat",
              amount: totalFat,
              color: "fat",
              percent: Math.min((totalFat / 65) * 100, 100),
            },
          ].map((item) => (
            <div className="nutrient-row" key={item.name}>
              <div className="nutrient-heading">
                <span>{item.name}</span>
                <strong>{item.amount} g</strong>
              </div>
              <div className="nutrient-track">
                <div
                  className={`nutrient-fill ${item.color}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}

          <p className="panel-note">
            Reference targets are illustrative, not personalized medical advice.
          </p>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Today's food log</h2>
              <p>{meals.length} food entries</p>
            </div>
            <button
              className="text-button"
              onClick={() => setMeals([])}
              disabled={meals.length === 0}
            >
              Clear demo log
            </button>
          </div>

          {meals.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <p>No food entries yet.</p>
              <span>Your food log is currently empty.</span>
            </div>
          ) : (
            <div className="meal-list">
              {meals.map((item) => (
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
                    <strong>{item.calories}</strong>
                    <span>kcal</span>
                    <button
                      className="remove-button"
                      onClick={() => removeMeal(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
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

// export default function Dashboard() {
//   return (
//     <div className="page-container">
//       <h1>Dashboard</h1>
//       <p>Welcome to NutriTrack!</p>

//       <div className="dashboard-grid">
//         <section className="dashboard-card">
//           <h2>Body Mass</h2>
//           <p>Track your body weight and BMI.</p>
//         </section>

//         <section className="dashboard-card">
//           <h2>Daily Calories</h2>
//           <p>Monitor your daily calorie intake.</p>
//         </section>

//         <section className="dashboard-card">
//           <h2>Nutrition</h2>
//           <p>Review your daily nutrition goals.</p>
//         </section>
//       </div>
//     </div>
//   );
// }
