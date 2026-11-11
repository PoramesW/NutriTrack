
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
const nutritionRoutes = require("./routes/nutrition.route");
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.route");
const analyticsRoutes = require("./routes/analytics.route");
const analyzationRoutes = require("./routes/analyzation.route");
const workoutRoutes = require("./routes/workout.route");

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/analyzation", analyzationRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NutriTrack API is running",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`NutriTrack API running at http://localhost:${PORT}`);
});
