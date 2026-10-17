
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ทดสอบว่า Backend ทำงานหรือไม่
app.get("/", (req, res) => {
  res.json({
    message: "NutriTrack API is running!",
  });
});

// ทดสอบ API สำหรับตรวจสอบสถานะระบบ
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "NutriTrack Backend",
  });
});

app.listen(PORT, () => {
  console.log(`NutriTrack API running at http://localhost:${PORT}`);
});
