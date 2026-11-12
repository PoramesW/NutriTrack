
const pool = require("../config/db");

// GET /api/catalog/ingredients?q=
async function searchIngredients(req, res) {
  try {
    const query = String(req.query.q || "").trim();

    const result = await pool.query(
      `SELECT
         id,
         name,
         serving_unit AS unit
       FROM foods
       WHERE is_active = TRUE
         AND owner_user_id IS NULL
         AND ($1 = '' OR name ILIKE $2)
       ORDER BY name ASC
       LIMIT 50`,
      [query, `%${query}%`]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Search ingredients error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to search food catalog",
    });
  }
}

// GET /api/catalog/ingredients/:id
async function getIngredientById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         id,
         name,
         serving_size,
         serving_unit AS unit,
         calories,
         protein,
         carbs,
         fat
       FROM foods
       WHERE id = $1
         AND is_active = TRUE
         AND owner_user_id IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get ingredient error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to get food information",
    });
  }
}

// POST /api/catalog/calculate
async function calculateNutrition(req, res) {
  try {
    const { id, quantity } = req.body;
    const amount = Number(quantity);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 0 and 10000",
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         name,
         serving_size,
         serving_unit,
         calories,
         protein,
         carbs,
         fat
       FROM foods
       WHERE id = $1
         AND is_active = TRUE
         AND owner_user_id IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    const food = result.rows[0];
    const servingSize = Number(food.serving_size);

    if (!Number.isFinite(servingSize) || servingSize <= 0) {
      return res.status(500).json({
        success: false,
        message: "Invalid food serving size",
      });
    }

    const multiplier = amount / servingSize;

    return res.json({
      id: food.id,
      name: food.name,
      quantity: amount,
      unit: food.serving_unit,
      calories: Number(food.calories) * multiplier,
      protein: Number(food.protein) * multiplier,
      carbs: Number(food.carbs) * multiplier,
      fat: Number(food.fat) * multiplier,
    });
  } catch (error) {
    console.error("Calculate nutrition error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate nutrition",
    });
  }
}

module.exports = {
  searchIngredients,
  getIngredientById,
  calculateNutrition,
};
