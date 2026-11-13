const pool = require("../config/db");

// GET /api/analytics/dashboard
async function getDashboard(req, res) {
  try {
    const userId = req.user.id;

    const [foodResult, weightResult, goalResult] = await Promise.all([
      pool.query(
        `SELECT
           id,
           food_name AS name,
           meal,
           quantity,
           calories,
           protein,
           carbs,
           fat,
           logged_at AS date
         FROM food_logs
         WHERE user_id = $1
           AND (logged_at AT TIME ZONE 'Asia/Bangkok')::date =
               (NOW() AT TIME ZONE 'Asia/Bangkok')::date
         ORDER BY logged_at DESC`,
        [userId]
      ),

      pool.query(
        `SELECT weight_kg, recorded_at
         FROM body_metrics
         WHERE user_id = $1
           AND weight_kg IS NOT NULL
         ORDER BY recorded_at DESC, created_at DESC
         LIMIT 1`,
        [userId]
      ),

      pool.query(
        `SELECT calories, protein, carbs, fat
         FROM nutrition_goals
         WHERE user_id = $1
         ORDER BY updated_at DESC
         LIMIT 1`,
        [userId]
      ),
    ]);

    const foods = foodResult.rows.map((food) => ({
      ...food,
      quantity: Number(food.quantity),
      calories: Number(food.calories),
      protein: Number(food.protein),
      carbs: Number(food.carbs),
      fat: Number(food.fat),
    }));

    const totals = foods.reduce(
      (sum, food) => {
        sum.calories += food.calories;
        sum.protein += food.protein;
        sum.carbs += food.carbs;
        sum.fat += food.fat;
        return sum;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const latestWeight = weightResult.rows[0]
      ? {
          weight: Number(weightResult.rows[0].weight_kg),
          recordedAt: weightResult.rows[0].recorded_at,
        }
      : null;

    const goal = goalResult.rows[0]
      ? {
          calories: Number(goalResult.rows[0].calories),
          protein: Number(goalResult.rows[0].protein),
          carbs: Number(goalResult.rows[0].carbs),
          fat: Number(goalResult.rows[0].fat),
        }
      : null;

    return res.json({
      success: true,
      data: {
        foods,
        totals,
        weight: latestWeight,
        goals: goal,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
    });
  }
}

// POST /api/analytics/weight
async function updateWeight(req, res) {
  try {
    const weight = Number(req.body.weight);

    if (!Number.isFinite(weight) || weight < 20 || weight > 350) {
      return res.status(400).json({
        success: false,
        message: "Weight must be between 20 and 350 kg",
      });
    }

    const result = await pool.query(
      `INSERT INTO body_metrics (user_id, weight_kg, recorded_at)
       VALUES ($1, $2, NOW())
       RETURNING id, weight_kg, recorded_at`,
      [req.user.id, weight]
    );

    return res.status(201).json({
      success: true,
      message: "Weight saved successfully",
      data: {
        id: result.rows[0].id,
        weight: Number(result.rows[0].weight_kg),
        recordedAt: result.rows[0].recorded_at,
      },
    });
  } catch (error) {
    console.error("Update weight error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save weight",
    });
  }
}

module.exports = {
  getDashboard,
  updateWeight,
};