
const crypto = require("crypto");

// เก็บข้อมูลในหน่วยความจำชั่วคราว ไม่ใช้ฐานข้อมูล
const foodLogs = new Map();

function getUserId(req) {
  // รองรับ userId ที่ส่งมาจาก Frontend สำหรับโปรเจกต์สาธิต
  // ไม่ใช่การยืนยันตัวตนที่ปลอดภัยสำหรับ Production
  return String(req.header("x-demo-user-id") || "demo-user");
}

function getLogs(userId) {
  if (!foodLogs.has(userId)) {
    foodLogs.set(userId, []);
  }

  return foodLogs.get(userId);
}

function validateFood(body) {
  const { name, calories, protein, carbs, fat, date } = body;

  if (typeof name !== "string" || !name.trim()) {
    return "Food name is required";
  }

  for (const [key, value] of Object.entries({
    calories,
    protein,
    carbs,
    fat,
  })) {
    if (
      value !== undefined &&
      (!Number.isFinite(Number(value)) || Number(value) < 0)
    ) {
      return `${key} must be a non-negative number`;
    }
  }

  if (date !== undefined && Number.isNaN(Date.parse(date))) {
    return "Invalid date";
  }

  return null;
}

// GET /api/food
function getFoods(req, res) {
  const logs = getLogs(getUserId(req));

  res.json({
    success: true,
    count: logs.length,
    data: logs,
  });
}

// POST /api/food
function addFood(req, res) {
  const error = validateFood(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  const {
    name,
    meal = "Breakfast",
    calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0,
    date,
  } = req.body;


  
const food = {
  id: crypto.randomUUID(),
  name: name.trim(),
  meal,
  calories: Number(calories),
  protein: Number(protein),
  carbs: Number(carbs),
  fat: Number(fat),
  date: date || new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

  const logs = getLogs(getUserId(req));
  logs.unshift(food);

  return res.status(201).json({
    success: true,
    message: "Food added successfully",
    data: food,
  });
}

// DELETE /api/food/:id
function deleteFood(req, res) {
  const logs = getLogs(getUserId(req));
  const index = logs.findIndex((food) => food.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Food record not found",
    });
  }

  const [deleted] = logs.splice(index, 1);

  return res.json({
    success: true,
    message: "Food deleted successfully",
    data: deleted,
  });
}

// GET /api/food/summary
function getFoodSummary(req, res) {
  const logs = getLogs(getUserId(req));

  const summary = logs.reduce(
    (total, food) => ({
      calories: total.calories + food.calories,
      protein: total.protein + food.protein,
      carbs: total.carbs + food.carbs,
      fat: total.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return res.json({
    success: true,
    count: logs.length,
    data: summary,
  });
}

module.exports = {
  getFoods,
  addFood,
  deleteFood,
  getFoodSummary,
};
