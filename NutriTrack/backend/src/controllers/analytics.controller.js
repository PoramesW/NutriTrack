
function getDashboard(req, res) {
  const { foods, exercises = [], goals } = req.body;

  if (!Array.isArray(foods)) {
    return res.status(400).json({
      success: false,
      message: "foods must be an array",
    });
  }

  if (!Array.isArray(exercises)) {
    return res.status(400).json({
      success: false,
      message: "exercises must be an array",
    });
  }

  const nutrients = ["calories", "protein", "carbs", "fat"];

  const isValidAmount = (value) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0;

  for (const food of foods) {
    for (const key of nutrients) {
      if (!food || !isValidAmount(food[key])) {
        return res.status(400).json({
          success: false,
          message: `Each food must have a valid ${key}`,
        });
      }
    }
  }

  for (const exercise of exercises) {
    if (!exercise || !isValidAmount(exercise.caloriesBurned)) {
      return res.status(400).json({
        success: false,
        message: "Each exercise must have valid caloriesBurned",
      });
    }
  }

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
          !isValidAmount(goals[key]) ||
          Number(goals[key]) === 0
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

  const consumed = foods.reduce(
    (total, food) => {
      nutrients.forEach((key) => {
        total[key] += Number(food[key]);
      });

      return total;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesBurned = exercises.reduce(
    (total, exercise) => total + Number(exercise.caloriesBurned),
    0
  );

  const nutrition = {};

  for (const key of nutrients) {
    nutrition[key] = {
      consumed: Math.round(consumed[key] * 100) / 100,
      goal: targets[key],
      remaining:
        Math.round((targets[key] - consumed[key]) * 100) / 100,
      percentage:
        Math.round((consumed[key] / targets[key]) * 10000) / 100,
    };
  }

  return res.json({
    success: true,
    data: {
      nutrition,
      exercise: {
        caloriesBurned: Math.round(caloriesBurned * 100) / 100,
        exerciseCount: exercises.length,
      },
      summary: {
        caloriesConsumed: Math.round(consumed.calories * 100) / 100,
        caloriesBurned: Math.round(caloriesBurned * 100) / 100,
        netCalories:
          Math.round((consumed.calories - caloriesBurned) * 100) / 100,
        foodCount: foods.length,
      },
    },
  });
}

module.exports = { getDashboard };
