const pool = require("../config/db");

// GET /api/analyzation?period=7
async function analyzeNutrition(req, res) {
  try {
    const userId = req.user.id;
    const period = req.query.period || "7";

    const allowedPeriods = ["1", "7", "28", "90", "365", "lifetime"];

    if (!allowedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis period",
      });
    }

    const params = [userId];
    let dateCondition = "";

    if (period !== "lifetime") {
      params.push(Number(period));

      dateCondition = `
        AND logged_at >=
          (NOW() AT TIME ZONE 'Asia/Bangkok')::date
          - ($2::integer - 1)
      `;
    }

    const [foodResult, weightResult, goalResult] = await Promise.all([
      pool.query(
        `SELECT
           TO_CHAR(
             (logged_at AT TIME ZONE 'Asia/Bangkok')::date,
             'YYYY-MM-DD'
           ) AS date,
           SUM(calories) AS calories,
           SUM(protein) AS protein,
           SUM(carbs) AS carbs,
           SUM(fat) AS fat
         FROM food_logs
         WHERE user_id = $1
           ${dateCondition}
         GROUP BY (logged_at AT TIME ZONE 'Asia/Bangkok')::date
         ORDER BY (logged_at AT TIME ZONE 'Asia/Bangkok')::date ASC`,
        params
      ),

      pool.query(
        `SELECT weight_kg, recorded_at
         FROM body_metrics
         WHERE user_id = $1
           AND weight_kg IS NOT NULL
           ${
             period === "lifetime"
               ? ""
               : `AND recorded_at >=
                    (NOW() AT TIME ZONE 'Asia/Bangkok')::date
                    - ($2::integer - 1)`
           }
         ORDER BY recorded_at ASC`,
        period === "lifetime" ? [userId] : params
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

    const dailyData = foodResult.rows.map((row) => ({
      date: row.date,
      calories: Number(row.calories),
      protein: Number(row.protein),
      carbs: Number(row.carbs),
      fat: Number(row.fat),
    }));

    const weightData = weightResult.rows.map((row) => ({
      date: row.recorded_at,
      weight: Number(row.weight_kg),
    }));

    const count = dailyData.length;

    const totals = dailyData.reduce(
      (sum, day) => {
        sum.calories += day.calories;
        sum.protein += day.protein;
        sum.carbs += day.carbs;
        sum.fat += day.fat;
        return sum;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const averages = {
      calories: count ? totals.calories / count : 0,
      protein: count ? totals.protein / count : 0,
      carbs: count ? totals.carbs / count : 0,
      fat: count ? totals.fat / count : 0,
    };

    const goals = goalResult.rows[0]
      ? {
          calories: Number(goalResult.rows[0].calories),
          protein: Number(goalResult.rows[0].protein),
          carbs: Number(goalResult.rows[0].carbs),
          fat: Number(goalResult.rows[0].fat),
        }
      : null;

    const highestCalories = count
      ? Math.max(...dailyData.map((day) => day.calories))
      : 0;

    const lowestCalories = count
      ? Math.min(...dailyData.map((day) => day.calories))
      : 0;

    return res.json({
      success: true,
      data: {
        period,
        daysAnalyzed: count,
        totals,
        averages,
        highestCalories,
        lowestCalories,
        goals,
        dailyData,
        weightData,
      },
    });
  } catch (error) {
    console.error("Analyze nutrition error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze nutrition data",
    });
  }
}

module.exports = { analyzeNutrition };