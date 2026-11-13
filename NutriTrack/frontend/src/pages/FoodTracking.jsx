
import { useEffect, useMemo, useState } from "react";
import { foodApi } from "../services/api";
import FoodCatalogPicker from "../components/food-catalog/FoodCatalogPicker";

const mealOptions = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
  { value: "Snack", label: "Snack" },
];

function formatNumber(value) {
  const number = Number(value);

  return (Number.isFinite(number) ? number : 0).toLocaleString(
    "en-US",
    { maximumFractionDigits: 1 }
  );
}

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
    quantity: Number(food.quantity ?? 1),
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
  const [selectedMeal, setSelectedMeal] = useState("All");
  const [entryMeal, setEntryMeal] = useState("Breakfast");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  function resetForm() {
    setShowForm(false);
    setEntryMeal("Breakfast");
  }

  async function handleAddCatalogFood(food) {
    setError("");
    setSaving(true);

    try {
      const payload = {
        food_id: food.food_id || food.id,
        name: food.name,
        meal: entryMeal,
        quantity: Number(food.quantity),
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbs: Number(food.carbs),
        fat: Number(food.fat),
      };

      const response = await foodApi.add(payload);

      const returnedFood =
        response?.food ??
        response?.data?.food ??
        response?.data ??
        response;

      if (
        !returnedFood ||
        typeof returnedFood !== "object" ||
        (returnedFood.id == null && returnedFood._id == null)
      ) {
        const refreshedResponse = await foodApi.getAll();
        setFoods(normalizeFoods(refreshedResponse));
      } else {
        const savedFood = normalizeFoods([returnedFood])[0];

        setFoods((current) => [...current, savedFood]);
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save food. Please try again."
        )
      );

      throw err;
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
            Search the food catalog, select a quantity, and add it to your food diary.
          </p>

          <div className="food-field">
            <label htmlFor="food-meal">Meal</label>
            <select
              id="food-meal"
              value={entryMeal}
              onChange={(event) => setEntryMeal(event.target.value)}
              disabled={saving}
            >
              {mealOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <FoodCatalogPicker
            onAdd={handleAddCatalogFood}
            meal={entryMeal}
          />
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
