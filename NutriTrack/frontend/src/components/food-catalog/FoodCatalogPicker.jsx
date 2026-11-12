
import { useEffect, useState } from "react";
import { catalogApi } from "../../services/api";

export default function FoodCatalogPicker({ onAdd, meal = "Snack" }) {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    catalogApi
      .searchIngredients(query)
      .then((data) => {
        if (active) {
          setFoods(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [query]);

  async function handleCalculate() {
    if (!selected) {
      setError("Please select a food first.");
      return;
    }

    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount < 0.1 || amount > 10000) {
      setError("Quantity must be between 0.1 and 10000.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await catalogApi.calculate(selected.id, amount);
      setNutrition(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!nutrition) return;

    if (typeof onAdd !== "function") {
      setError("Food saving is not configured.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onAdd({
        ...nutrition,
        food_id: nutrition.id,
        meal,
      });

      setSelected(null);
      setQuantity(1);
      setNutrition(null);
      setQuery("");
    } catch (err) {
      setError(err.message || "Unable to save food.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="food-catalog-picker">
      <h2>Add food from catalog</h2>

      <label htmlFor="food-search">Search food</label>
      <input
        id="food-search"
        type="text"
        placeholder="e.g. chicken, rice, egg"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelected(null);
          setNutrition(null);
          setError("");
        }}
      />

      <div className="food-catalog-results">
        {foods.map((food) => (
          <button
            key={food.id}
            type="button"
            onClick={() => {
              setSelected(food);
              setNutrition(null);
              setError("");
            }}
          >
            {food.name} — {food.unit}
            {selected?.id === food.id ? " ✓" : ""}
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <p>
            Selected: <strong>{selected.name}</strong>
          </p>

          <label htmlFor="food-quantity">
            Quantity ({selected.unit})
          </label>

          <input
            id="food-quantity"
            type="number"
            min="0.1"
            max="10000"
            step="0.1"
            value={quantity}
            onChange={(event) => {
              setQuantity(event.target.value);
              setNutrition(null);
            }}
          />

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate nutrition"}
          </button>
        </div>
      )}

      {nutrition && (
        <div className="food-nutrition-preview">
          <h3>{nutrition.name}</h3>
          <p>Calories: {Number(nutrition.calories).toFixed(1)} kcal</p>
          <p>Protein: {Number(nutrition.protein).toFixed(1)} g</p>
          <p>Carbs: {Number(nutrition.carbs).toFixed(1)} g</p>
          <p>Fat: {Number(nutrition.fat).toFixed(1)} g</p>

          <button
            type="button"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "Saving..." : "Add to food log"}
          </button>
        </div>
      )}

      {error && <p role="alert">{error}</p>}
    </section>
  );
}
