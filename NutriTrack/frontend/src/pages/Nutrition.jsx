
import { useState } from "react";

function calculateNutrition({ weight, height, age, sex, activity, goal }) {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    (sex === "male" ? 5 : -161);

  const tdee = bmr * activity;

  const calorieGoal =
    goal === "lose"
      ? tdee - 300
      : goal === "gain"
        ? tdee + 300
        : tdee;

  let bmiCategory = "Normal weight";

  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Normal weight";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Obesity";

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    calorieGoal: Math.max(0, calorieGoal),
  };
}

export default function Nutrition() {
  const [form, setForm] = useState({
    weight: "65",
    height: "170",
    age: "25",
    sex: "male",
    activity: "1.375",
    goal: "maintain",
  });

  const [result, setResult] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const weight = Number(form.weight);
    const height = Number(form.height);
    const age = Number(form.age);

    if (
      !Number.isFinite(weight) ||
      !Number.isFinite(height) ||
      !Number.isFinite(age) ||
      weight <= 0 ||
      height <= 0 ||
      age < 18 ||
      age > 100
    ) {
      setResult(null);
      return;
    }

    setResult(
      calculateNutrition({
        ...form,
        weight,
        height,
        age,
        activity: Number(form.activity),
      })
    );
  }

  return (
    <div className="nutrition-page">
      <header className="nutrition-header">
        <p className="eyebrow">PERSONAL NUTRITION</p>
        <h1>Nutrition Calculator</h1>
        <p>
          Calculate your BMI, estimated energy needs, and daily calorie goal.
        </p>
      </header>

      <div className="nutrition-layout">
        <section className="nutrition-panel">
          <h2>Your information</h2>
          <p className="nutrition-muted">
            Enter your details to calculate your estimated daily needs.
          </p>

          <form className="nutrition-form" onSubmit={handleSubmit}>
            <div className="nutrition-field">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                name="weight"
                type="number"
                min="20"
                max="350"
                step="0.1"
                value={form.weight}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nutrition-field">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                name="height"
                type="number"
                min="100"
                max="250"
                step="0.1"
                value={form.height}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nutrition-field">
              <label htmlFor="age">Age (18–100)</label>
              <input
                id="age"
                name="age"
                type="number"
                min="18"
                max="100"
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nutrition-field">
              <label htmlFor="sex">Sex used by the formula</label>
              <select
                id="sex"
                name="sex"
                value={form.sex}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="nutrition-field full-width">
              <label htmlFor="activity">Activity level</label>
              <select
                id="activity"
                name="activity"
                value={form.activity}
                onChange={handleChange}
              >
                <option value="1.2">
                  Sedentary — little or no exercise
                </option>
                <option value="1.375">
                  Light — exercise 1–3 days/week
                </option>
                <option value="1.55">
                  Moderate — exercise 3–5 days/week
                </option>
                <option value="1.725">
                  Active — exercise 6–7 days/week
                </option>
                <option value="1.9">
                  Very active — strenuous activity
                </option>
              </select>
            </div>

            <div className="nutrition-field full-width">
              <label htmlFor="goal">Your goal</label>
              <select
                id="goal"
                name="goal"
                value={form.goal}
                onChange={handleChange}
              >
                <option value="lose">Lose weight gradually</option>
                <option value="maintain">Maintain weight</option>
                <option value="gain">Gain weight gradually</option>
              </select>
            </div>

            <button className="nutrition-submit" type="submit">
              Calculate my results
            </button>
          </form>
        </section>

        <section className="nutrition-panel results-panel">
          <h2>Your results</h2>
          <p className="nutrition-muted">
            Estimates based on the information you provide.
          </p>

          {!result ? (
            <div className="nutrition-empty">
              <span>📊</span>
              <h3>Ready to calculate</h3>
              <p>
                Complete the form and select Calculate to see your results.
              </p>
            </div>
          ) : (
            <>
              <div className="nutrition-result-card">
                <span>Body Mass Index (BMI)</span>
                <strong>{result.bmi.toFixed(1)}</strong>
                <span className="result-category">
                  {result.bmiCategory}
                </span>
              </div>

              <div className="nutrition-result-card">
                <span>Basal Metabolic Rate (BMR)</span>
                <strong>
                  {Math.round(result.bmr).toLocaleString()} kcal
                </strong>
                <span className="result-category">
                  Estimated energy at rest per day
                </span>
              </div>

              <div className="nutrition-result-card">
                <span>Total Daily Energy Expenditure (TDEE)</span>
                <strong>
                  {Math.round(result.tdee).toLocaleString()} kcal
                </strong>
                <span className="result-category">
                  Estimated daily energy expenditure
                </span>
              </div>

              <div className="nutrition-result-card calorie-goal-result">
                <span>Suggested daily calorie goal</span>
                <strong>
                  {Math.round(result.calorieGoal).toLocaleString()} kcal
                </strong>
                <span className="result-category">
                  An estimate based on your selected goal
                </span>
              </div>
            </>
          )}
        </section>
      </div>

      <p className="nutrition-disclaimer">
        These calculations are estimates, not a medical diagnosis or
        individualized clinical advice. BMI is a screening measure and does
        not directly measure body fat.
      </p>
    </div>
  );
}
