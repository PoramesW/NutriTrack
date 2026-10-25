
const express = require("express");
const router = express.Router();

const {
  analyzeNutrition,
} = require("../controllers/analyzation.controller");

router.post("/", analyzeNutrition);

module.exports = router;
