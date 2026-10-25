
const crypto = require("crypto");

const workouts = new Map();

function getUserId(req) {
  return String(req.header("x-demo-user-id") || "demo-user");
}

function getUserWorkouts(userId) {
  if (!workouts.has(userId)) {
    workouts.set(userId, []);
  }

  return workouts.get(userId);
}

function getWorkouts(req, res) {
  const data = getUserWorkouts(getUserId(req));

  return res.json({
    success: true,
    count: data.length,
    data,
  });
}

function addWorkout(req, res) {
  const {
    name,
    durationMinutes,
    caloriesBurned = 0,
    date,
  } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Workout name is required",
    });
  }

  if (
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "durationMinutes must be a positive number",
    });
  }

  if (
    !Number.isFinite(caloriesBurned) ||
    caloriesBurned < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "caloriesBurned must be a non-negative number",
    });
  }

  if (date !== undefined && Number.isNaN(Date.parse(date))) {
    return res.status(400).json({
      success: false,
      message: "Invalid date",
    });
  }

  const workout = {
    id: crypto.randomUUID(),
    name: name.trim(),
    durationMinutes,
    caloriesBurned,
    date: date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const data = getUserWorkouts(getUserId(req));
  data.unshift(workout);

  return res.status(201).json({
    success: true,
    message: "Workout added successfully",
    data: workout,
  });
}

function deleteWorkout(req, res) {
  const data = getUserWorkouts(getUserId(req));
  const index = data.findIndex(
    (workout) => workout.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Workout not found",
    });
  }

  const [deleted] = data.splice(index, 1);

  return res.json({
    success: true,
    message: "Workout deleted successfully",
    data: deleted,
  });
}

function getWorkoutSummary(req, res) {
  const data = getUserWorkouts(getUserId(req));

  const summary = data.reduce(
    (result, workout) => {
      result.totalDurationMinutes += workout.durationMinutes;
      result.totalCaloriesBurned += workout.caloriesBurned;
      return result;
    },
    {
      workoutCount: data.length,
      totalDurationMinutes: 0,
      totalCaloriesBurned: 0,
    }
  );

  return res.json({
    success: true,
    data: summary,
  });
}

module.exports = {
  getWorkouts,
  addWorkout,
  deleteWorkout,
  getWorkoutSummary,
};
