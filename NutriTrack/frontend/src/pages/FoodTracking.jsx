
import { useEffect, useMemo, useState } from "react";
import { foodApi } from "../services/api";

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

const numericFields = ["calories", "protein", "carbs", "fat"];

function formatNumber(value) {
  const number = Number(value);
  return (Number.isFinite(number) ? number : 0).toLocaleString(
    "en-US",
    { maximumFractionDigits: 1 }
  );
}

// รองรับทั้ง API ที่ส่ง Array โดยตรง
// และ API ที่ส่ง { foods: [...] } หรือ { data: [...] }
function normalizeFoods(response) {
  let items = response;

  if (!Array.isArray(items)) {
    items = response?.foods ?? response?.data ?? response?.items;
  }

  if (!Array.isArray(items)) {
    throw new Error("The API returned an invalid food list.");
  }

  return items.map((food) => ({
    ...food,
    id: food.id ?? food._id,
    name: String(food.name ?? ""),
    meal: food.meal ?? "Snack",
    calories: Number(food.calories ?? 0),
    protein: Number(food.protein ?? 0),
    carbs: Number(food.carbs ?? 0),
    fat: Number(food.fat ?? 0),
  }));
}

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

export default function FoodTracking() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedMeal, setSelectedMeal] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // โหลดข้อมูลจาก Backend ตอนเปิดหน้า
  useEffect(() => {
    let cancelled = false;

    async function loadFoods() {
      setLoading(true);
      setError("");

      try {
        const response = await foodApi.getAll();
        const loadedFoods = normalizeFoods(response);

        if (!cancelled) {
          setFoods(loadedFoods);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Unable to load food entries. Please try again."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFoods();

    return () => {
      cancelled = true;
    };
  }, []);

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

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleAddFood(event) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();

    if (!name) {
      setError("Please enter a food name.");
      return;
    }

    const invalidNumber = numericFields.some((field) => {
      const value = form[field];

      return (
        value === "" ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0 ||
        Number(value) > 100000
      );
    });

    if (invalidNumber) {
      setError("Enter valid non-negative nutrient values.");
      return;
    }

    const payload = {
      name,
      meal: form.meal,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
    };

    setSaving(true);

    try {
      const response = await foodApi.add(payload);

      // รองรับ API ที่ส่งรายการที่สร้างแล้วกลับมา
      const returnedFood =
        response?.food ??
        response?.data?.food ??
        response?.data ??
        response;

      let savedFood;

      if (
        returnedFood &&
        typeof returnedFood === "object" &&
        (returnedFood.id != null || returnedFood._id != null)
      ) {
        savedFood = normalizeFoods([returnedFood])[0];
      } else {
        // ถ้า API ไม่ส่ง ID กลับมา ให้โหลดรายการใหม่
        const refreshedResponse = await foodApi.getAll();
        const refreshedFoods = normalizeFoods(refreshedResponse);

        setFoods(refreshedFoods);
        resetForm();
        return;
      }

      setFoods((current) => [...current, savedFood]);
      resetForm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save food. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveFood(id) {
    if (id == null || deletingId != null) {
      return;
    }

    setError("");
    setDeletingId(id);

    try {
      await foodApi.delete(id);

      setFoods((current) =>
        current.filter((food) => String(food.id) !== String(id))
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to remove food. Please try again."
        )
      );
    } finally {
      setDeletingId(null);
    }
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
          type="button"
          className="food-primary-button"
          onClick={() => {
            setError("");

            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          disabled={saving}
        >
          {showForm ? "Cancel" : "+ Add food"}
        </button>
      </header>

      {loading && (
        <p role="status">Loading food entries...</p>
      )}

      {error && (
        <p className="food-error" role="alert">
          {error}
        </p>
      )}

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

            <div className="food-form-actions">
              <button
                type="button"
                className="food-secondary-button"
                onClick={() => {
                  resetForm();
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="food-primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save food"}
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
              {foods.length}{" "}
              {foods.length === 1 ? "entry" : "entries"} recorded
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

        {loading ? (
          <div className="food-empty-state">
            <p>Loading your food diary...</p>
          </div>
        ) : filteredFoods.length === 0 ? (
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
                      <span className="food-meal-tag">
                        {food.meal}
                      </span>
                    </td>
                    <td>{formatNumber(food.calories)}</td>
                    <td>{formatNumber(food.protein)} g</td>
                    <td>{formatNumber(food.carbs)} g</td>
                    <td>{formatNumber(food.fat)} g</td>
                    <td>
                      <button
                        type="button"
                        className="food-remove-button"
                        onClick={() => handleRemoveFood(food.id)}
                        disabled={deletingId != null}
                        aria-label={`Remove ${food.name}`}
                      >
                        {String(deletingId) === String(food.id)
                          ? "Removing..."
                          : "Remove"}
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
