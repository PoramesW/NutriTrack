
const express = require("express");
const router = express.Router();

const {
  getFoods,
  addFood,
  deleteFood,
  getFoodSummary,
} = require("../controllers/food.controller");

const authMiddleware = require("../middleware/auth");

// ทุก endpoint ใน Food Tracking ต้องผ่าน JWT
router.use(authMiddleware);

router.get("/summary", getFoodSummary);
router.get("/", getFoods);
router.post("/", addFood);
router.delete("/:id", deleteFood);

module.exports = router;
