
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const nutritionRoutes = require("./routes/nutrition.route");
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.route");const foodRoutes = require("./routes/food.route");
const app = express();
const analyticsRoutes = require("./routes/analytics.route");
const analyzationRoutes = require("./routes/analyzation.route");
const workoutRoutes = require("./routes/workout.route");
const PORT = process.env.PORT || 5000;

app.use("/api/food", foodRoutes);
app.use(cors());
app.use(express.json());
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/analyzation", analyzationRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NutriTrack API is running",
  });
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`NutriTrack API running at http://localhost:${PORT}`);
});
