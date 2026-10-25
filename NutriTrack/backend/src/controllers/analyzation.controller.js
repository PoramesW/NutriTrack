
function analyzeNutrition(req, res) {
  const { history, goals } = req.body;

  if (!Array.isArray(history)) {
    return res.status(400).json({
      success: false,
      message: "history must be an array",
    });
  }

  const defaultGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  const targets = { ...defaultGoals };
  const nutrients = ["calories", "protein", "carbs", "fat"];

  if (goals !== undefined) {
    if (!goals || typeof goals !== "object" || Array.isArray(goals)) {
      return res.status(400).json({
        success: false,
        message: "goals must be an object",
      });
    }

    for (const key of nutrients) {
      if (goals[key] !== undefined) {
        const value = Number(goals[key]);

        if (!Number.isFinite(value) || value <= 0) {
          return res.status(400).json({
            success: false,
            message: `Goal ${key} must be greater than zero`,
          });
        }

        targets[key] = value;
      }
    }
  }

  for (const day of history) {
    if (!day || typeof day.date !== "string" || !day.date.trim()) {
      return res.status(400).json({
        success: false,
        message: "Each history entry must have a date",
      });
    }

    for (const key of nutrients) {
      const value = day[key];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Each history entry must have a valid ${key}`,
        });
      }
    }
  }

  const totals = history.reduce(
    (result, day) => {
      nutrients.forEach((key) => {
        result[key] += Number(day[key]);
      });
      return result;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const count = history.length;
  const averages = {};

  nutrients.forEach((key) => {
    averages[key] = count
      ? Math.round((totals[key] / count) * 100) / 100
      : 0;
  });

  const dailyAnalysis = history.map((day) => ({
    date: day.date,
    calories: Number(day.calories),
    protein: Number(day.protein),
    carbs: Number(day.carbs),
    fat: Number(day.fat),
    calorieGoalMet: Number(day.calories) <= targets.calories,
    proteinGoalMet: Number(day.protein) >= targets.protein,
  }));

  const daysOverCalorieGoal = dailyAnalysis.filter(
    (day) => day.calories > targets.calories
  ).length;

  const daysMeetingProteinGoal = dailyAnalysis.filter(
    (day) => day.protein >= targets.protein
  ).length;

  return res.json({
    success: true,
    data: {
      daysAnalyzed: count,
      totals,
      averages,
      goals: targets,
      summary: {
        daysOverCalorieGoal,
        daysMeetingProteinGoal,
        daysWithinCalorieGoal: count - daysOverCalorieGoal,
      },
      dailyAnalysis,
    },
  });
}

module.exports = { analyzeNutrition };
