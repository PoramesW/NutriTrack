const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.route");
const nutritionRoutes = require("./routes/nutrition.route");
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
app.use("/api/analyzation", analyzationRoutes);
app.use("/api/workouts", workoutRoutes);

// Catalog route (if available)
const catalogRoutePath = path.join(__dirname, "routes", "catalog.route.js");

if (fs.existsSync(catalogRoutePath)) {
  const catalogRoutes = require("./routes/catalog.route");
  app.use("/api/catalog", catalogRoutes);
}

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NutriTrack API is running"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`NutriTrack API running at http://localhost:${PORT}`);
});
