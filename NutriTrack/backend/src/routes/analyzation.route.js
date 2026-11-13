const express = require("express");
const router = express.Router();

const {
  analyzeNutrition,
} = require("../controllers/analyzation.controller");

const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/", analyzeNutrition);

module.exports = router;