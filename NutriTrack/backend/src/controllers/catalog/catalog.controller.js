const ingredients = require("../../data/ingredients.json");

const searchIngredients = (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim();

  const results = ingredients.filter((item) => {
    const matchesName =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q);

    const matchesCategory =
      !category || item.category === category;

    return matchesName && matchesCategory;
  });

  res.json(results);
};

const getIngredientById = (req, res) => {
  const item = ingredients.find(
    (ingredient) => ingredient.id === req.params.id
  );

  if (!item) {
    return res.status(404).json({
      message: "ไม่พบข้อมูลอาหาร"
    });
  }

  res.json(item);
};

const calculateNutrition = (req, res) => {
  const { id, quantity } = req.body;

  const item = ingredients.find(
    (ingredient) => ingredient.id === id
  );

  if (!item) {
    return res.status(404).json({
      message: "ไม่พบข้อมูลอาหาร"
    });
  }

  const amount = Number(quantity);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
    return res.status(400).json({
      message: "ปริมาณต้องมากกว่า 0 และไม่เกิน 10000 หน่วย"
    });
  }

  res.json({
    id: item.id,
    name: item.name,
    quantity: amount,
    unit: item.unit,
    calories: item.calories * amount,
    protein: item.protein * amount,
    carbs: item.carbs * amount,
    fat: item.fat * amount
  });
};

module.exports = {
  searchIngredients,
  getIngredientById,
  calculateNutrition
};