
const express = require("express");
const router = express.Router();

const {
  calculateNutrition,
} = require("../controllers/nutrition.controller");

router.post("/calculate", calculateNutrition);

module.exports = router;
