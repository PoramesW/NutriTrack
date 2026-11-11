import { useEffect, useState } from "react";
import { catalogApi } from "../../services/api";

export default function FoodCatalogPicker({ onAdd }) {
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
        if (active) setFoods(data);
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
      setError("กรุณาเลือกอาหารก่อน");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await catalogApi.calculate(
        selected.id,
        quantity
      );

      setNutrition(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    if (!nutrition) return;

    if (typeof onAdd !== "function") {
      setError("ยังไม่ได้เชื่อมฟังก์ชันบันทึกอาหาร");
      return;
    }

    onAdd({
      ...nutrition,
      meal: "Snack"
    });

    setSelected(null);
    setQuantity(1);
    setNutrition(null);
    setQuery("");
    setError("");
  }

  return (
    <section className="food-catalog-picker">
      <h2>เพิ่มอาหารจากฐานข้อมูล</h2>

      <label htmlFor="food-search">ค้นหาอาหาร</label>
      <input
        id="food-search"
        type="text"
        placeholder="เช่น อกไก่ ข้าวสวย ไข่ไก่"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
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
            เลือกแล้ว: <strong>{selected.name}</strong>
          </p>

          <label htmlFor="food-quantity">
            จำนวนหน่วย ({selected.unit})
          </label>

          <input
            id="food-quantity"
            type="number"
            min="0.1"
            max="10000"
            step="0.1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setNutrition(null);
            }}
          />

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? "กำลังคำนวณ..." : "คำนวณสารอาหาร"}
          </button>
        </div>
      )}

      {nutrition && (
        <div className="food-nutrition-preview">
          <h3>{nutrition.name}</h3>
          <p>พลังงาน: {nutrition.calories.toFixed(1)} kcal</p>
          <p>โปรตีน: {nutrition.protein.toFixed(1)} g</p>
          <p>คาร์โบไฮเดรต: {nutrition.carbs.toFixed(1)} g</p>
          <p>ไขมัน: {nutrition.fat.toFixed(1)} g</p>

          <button type="button" onClick={handleAdd}>
            เพิ่มลงรายการอาหาร
          </button>
        </div>
      )}

      {error && <p role="alert">{error}</p>}
    </section>
  );
}