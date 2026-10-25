
function calculateNutrition(req, res) {
  const { foods, goals } = req.body;

  if (!Array.isArray(foods)) {
    return res.status(400).json({
      success: false,
      message: "foods must be an array",
    });
  }

  const nutrients = ["calories", "protein", "carbs", "fat"];

  for (const food of foods) {
    if (!food || typeof food !== "object") {
      return res.status(400).json({
        success: false,
        message: "Each food must be an object",
      });
    }

    for (const nutrient of nutrients) {
      if (
        food[nutrient] === undefined ||
        !Number.isFinite(Number(food[nutrient])) ||
        Number(food[nutrient]) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Each food must have a valid non-negative ${nutrient}`,
        });
      }
    }
  }

  const totals = foods.reduce(
    (result, food) => {
      nutrients.forEach((key) => {
        result[key] += Number(food[key]);
      });

      return result;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const defaultGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  const targets = { ...defaultGoals };

  if (goals !== undefined) {
    if (!goals || typeof goals !== "object" || Array.isArray(goals)) {
      return res.status(400).json({
        success: false,
        message: "goals must be an object",
      });
    }

    for (const key of nutrients) {
      if (goals[key] !== undefined) {
        if (
          !Number.isFinite(Number(goals[key])) ||
          Number(goals[key]) <= 0
        ) {
          return res.status(400).json({
            success: false,
            message: `Goal ${key} must be greater than zero`,
          });
        }

        targets[key] = Number(goals[key]);
      }
    }
  }

  const comparison = {};

  nutrients.forEach((key) => {
    comparison[key] = {
      consumed: Math.round(totals[key] * 100) / 100,
      goal: targets[key],
      remaining:
        Math.round((targets[key] - totals[key]) * 100) / 100,
      percentage:
        Math.round((totals[key] / targets[key]) * 10000) / 100,
    };
  });

  return res.json({
    success: true,
    data: {
      totals: comparison,
      foodCount: foods.length,
    },
  });
}

module.exports = { calculateNutrition };
