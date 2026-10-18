
import { useMemo, useState } from "react";

const initialFoods = [
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
    name: "ไข่ต้ม 2 ฟอง",
    meal: "Breakfast",
    calories: 156,
    protein: 13,
    carbs: 1,
    fat: 11,
  },
  {
    id: 3,
    name: "อกไก่ต้ม",
    meal: "Dinner",
    calories: 220,
    protein: 42,
    carbs: 0,
    fat: 5,
  },
];

const emptyForm = {
  name: "",
  meal: "Breakfast",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

const mealOptions = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
  { value: "Snack", label: "Snack" },
];

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });
}

export default function FoodTracking() {
  const [foods, setFoods] = useState(initialFoods);
  const [form, setForm] = useState(emptyForm);
  const [selectedMeal, setSelectedMeal] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(
    () =>
      foods.reduce(
        (total, food) => ({
          calories: total.calories + food.calories,
          protein: total.protein + food.protein,
          carbs: total.carbs + food.carbs,
          fat: total.fat + food.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [foods]
  );

  const filteredFoods =
    selectedMeal === "All"
      ? foods
      : foods.filter((food) => food.meal === selectedMeal);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleAddFood(event) {
    event.preventDefault();
    setError("");

    const numericFields = [
      "calories",
      "protein",
      "carbs",
      "fat",
    ];

    const invalidNumber = numericFields.some((field) => {
      const value = Number(form[field]);
      return (
        form[field] === "" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100000
      );
    });

    if (!form.name.trim()) {
      setError("Please enter a food name.");
      return;
    }

    if (invalidNumber) {
      setError("Enter valid non-negative nutrient values.");
      return;
    }

    const newFood = {
      id: `${Date.now()}-${Math.random()}`,
      name: form.name.trim(),
      meal: form.meal,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
    };

    setFoods((current) => [...current, newFood]);
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleRemoveFood(id) {
    setFoods((current) => current.filter((food) => food.id !== id));
  }

  return (
    <div className="food-page">
      <header className="food-page-header">
        <div>
          <p className="eyebrow">DAILY NUTRITION</p>
          <h1>Food Tracking</h1>
          <p className="food-description">
            Record your meals and keep track of your daily nutrients.
          </p>
        </div>

        <button
          className="food-primary-button"
          onClick={() => {
            setError("");
            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Cancel" : "+ Add food"}
        </button>
      </header>

      <div className="food-demo-notice">
        Demo mode — entries reset when you refresh this page.
      </div>

      {showForm && (
        <section className="food-panel food-form-panel">
          <h2>Add a food entry</h2>
          <p className="food-muted">
            Enter the nutrient values for the portion you ate.
          </p>

          <form className="food-entry-form" onSubmit={handleAddFood}>
            <div className="food-field food-field-wide">
              <label htmlFor="food-name">Food name</label>
              <input
                id="food-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Grilled chicken and rice"
                maxLength={100}
                required
              />
            </div>

            <div className="food-field">
              <label htmlFor="food-meal">Meal</label>
              <select
                id="food-meal"
                name="meal"
                value={form.meal}
                onChange={handleChange}
              >
                {mealOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="food-field">
              <label htmlFor="food-calories">Calories (kcal)</label>
              <input
                id="food-calories"
                name="calories"
                type="number"
                min="0"
                max="100000"
                step="any"
                value={form.calories}
                onChange={handleChange}
                required
              />
            </div>

            <div className="food-field">
              <label htmlFor="food-protein">Protein (g)</label>
              <input
                id="food-protein"
                name="protein"
                type="number"
                min="0"
                max="100000"
                step="any"
                value={form.protein}
                onChange={handleChange}
                required
              />
            </div>

            <div className="food-field">
              <label htmlFor="food-carbs">Carbohydrates (g)</label>
              <input
                id="food-carbs"
                name="carbs"
                type="number"
                min="0"
                max="100000"
                step="any"
                value={form.carbs}
                onChange={handleChange}
                required
              />
            </div>

            <div className="food-field">
              <label htmlFor="food-fat">Fat (g)</label>
              <input
                id="food-fat"
                name="fat"
                type="number"
                min="0"
                max="100000"
                step="any"
                value={form.fat}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <p className="food-error" role="alert">
                {error}
              </p>
            )}

            <div className="food-form-actions">
              <button
                type="button"
                className="food-secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                  setError("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="food-primary-button">
                Save food
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="food-summary-grid">
        <article className="food-summary-card food-calorie-card">
          <span className="food-summary-label">Total calories</span>
          <strong>{formatNumber(totals.calories)}</strong>
          <span className="food-summary-unit">kcal consumed</span>
        </article>

        <article className="food-summary-card">
          <span className="food-summary-label">Protein</span>
          <strong>{formatNumber(totals.protein)}</strong>
          <span className="food-summary-unit">grams</span>
        </article>

        <article className="food-summary-card">
          <span className="food-summary-label">Carbohydrates</span>
          <strong>{formatNumber(totals.carbs)}</strong>
          <span className="food-summary-unit">grams</span>
        </article>

        <article className="food-summary-card">
          <span className="food-summary-label">Fat</span>
          <strong>{formatNumber(totals.fat)}</strong>
          <span className="food-summary-unit">grams</span>
        </article>
      </section>

      <section className="food-panel">
        <div className="food-list-header">
          <div>
            <h2>Food diary</h2>
            <p className="food-muted">
              {foods.length} {foods.length === 1 ? "entry" : "entries"} recorded
            </p>
          </div>

          <label className="food-filter">
            <span>Meal</span>
            <select
              value={selectedMeal}
              onChange={(event) => setSelectedMeal(event.target.value)}
              aria-label="Filter food by meal"
            >
              <option value="All">All meals</option>
              {mealOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="food-empty-state">
            <span>🍽️</span>
            <h3>No food entries</h3>
            <p>Add a food entry or select another meal filter.</p>
          </div>
        ) : (
          <div className="food-table-wrapper">
            <table className="food-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Meal</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.map((food) => (
                  <tr key={food.id}>
                    <td className="food-name-cell">{food.name}</td>
                    <td>
                      <span className="food-meal-tag">{food.meal}</span>
                    </td>
                    <td>{formatNumber(food.calories)}</td>
                    <td>{formatNumber(food.protein)} g</td>
                    <td>{formatNumber(food.carbs)} g</td>
                    <td>{formatNumber(food.fat)} g</td>
                    <td>
                      <button
                        className="food-remove-button"
                        onClick={() => handleRemoveFood(food.id)}
                        aria-label={`Remove ${food.name}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Total · all logged foods</td>
                  <td>{formatNumber(totals.calories)}</td>
                  <td>{formatNumber(totals.protein)} g</td>
                  <td>{formatNumber(totals.carbs)} g</td>
                  <td>{formatNumber(totals.fat)} g</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
