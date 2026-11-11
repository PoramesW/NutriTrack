const express = require("express");

const {
  searchIngredients,
  getIngredientById,
  calculateNutrition
} = require("../controllers/catalog.controller");

const router = express.Router();

router.get("/ingredients", searchIngredients);
router.get("/ingredients/:id", getIngredientById);
router.post("/calculate", calculateNutrition);

module.exports = router;