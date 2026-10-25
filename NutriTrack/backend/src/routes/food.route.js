
const express = require("express");
const router = express.Router();

const {
  getFoods,
  addFood,
  deleteFood,
  getFoodSummary,
} = require("../controllers/food.controller");

router.get("/summary", getFoodSummary);
router.get("/", getFoods);
router.post("/", addFood);
router.delete("/:id", deleteFood);

module.exports = router;
