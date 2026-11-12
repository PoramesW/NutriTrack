
const pool = require("../config/db");

function validateFood(body) {
  const name = body.name ?? body.food_name;

  if (typeof name !== "string" || !name.trim()) {
    return "Food name is required";
  }

  for (const key of ["calories", "protein", "carbs", "fat", "quantity"]) {
    const value = body[key];

    if (
      value !== undefined &&
      (!Number.isFinite(Number(value)) ||
        Number(value) < (key === "quantity" ? 0.1 : 0))
    ) {
      return `${key} must be a valid non-negative number`;
    }
  }

  const date = body.date ?? body.logged_at;

  if (date !== undefined && Number.isNaN(Date.parse(date))) {
    return "Invalid date";
  }

  return null;
}

// GET /api/food
async function getFoods(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         id,
         food_id,
         food_name AS name,
         meal,
         quantity,
         calories,
         protein,
         carbs,
         fat,
         logged_at AS date,
         created_at AS "createdAt"
       FROM food_logs
       WHERE user_id = $1
       ORDER BY logged_at DESC`,
      [req.user.id]
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get foods error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve food records",
    });
  }
}

// POST /api/food
async function addFood(req, res) {
  try {
    const error = validateFood(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const {
      name,
      food_name,
      id,
      food_id,
      meal = "Breakfast",
      quantity = 1,
      calories = 0,
      protein = 0,
      carbs = 0,
      fat = 0,
      date,
      logged_at,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO food_logs (
         user_id,
         food_id,
         food_name,
         meal,
         quantity,
         calories,
         protein,
         carbs,
         fat,
         logged_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, NOW()))
       RETURNING
         id,
         food_id,
         food_name AS name,
         meal,
         quantity,
         calories,
         protein,
         carbs,
         fat,
         logged_at AS date,
         created_at AS "createdAt"`,
      [
        req.user.id,
        food_id || id || null,
        (name || food_name).trim(),
        meal,
        Number(quantity),
        Number(calories),
        Number(protein),
        Number(carbs),
        Number(fat),
        date || logged_at || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Food added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Add food error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to add food record",
    });
  }
}

// DELETE /api/food/:id
async function deleteFood(req, res) {
  try {
    const result = await pool.query(
      `DELETE FROM food_logs
       WHERE id = $1 AND user_id = $2
       RETURNING id, food_name AS name`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food record not found",
      });
    }

    return res.json({
      success: true,
      message: "Food deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete food error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete food record",
    });
  }
}

// GET /api/food/summary
async function getFoodSummary(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) AS count,
         COALESCE(SUM(calories), 0) AS calories,
         COALESCE(SUM(protein), 0) AS protein,
         COALESCE(SUM(carbs), 0) AS carbs,
         COALESCE(SUM(fat), 0) AS fat
       FROM food_logs
       WHERE user_id = $1`,
      [req.user.id]
    );

    const summary = result.rows[0];

    return res.json({
      success: true,
      count: Number(summary.count),
      data: {
        calories: Number(summary.calories),
        protein: Number(summary.protein),
        carbs: Number(summary.carbs),
        fat: Number(summary.fat),
      },
    });
  } catch (error) {
    console.error("Get food summary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve food summary",
    });
  }
}

module.exports = {
  getFoods,
  addFood,
  deleteFood,
  getFoodSummary,
};
