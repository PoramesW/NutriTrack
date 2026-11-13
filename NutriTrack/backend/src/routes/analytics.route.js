const express = require("express");
const router = express.Router();

const {
  getDashboard,
  updateWeight,
} = require("../controllers/analytics.controller");

const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/dashboard", getDashboard);
router.post("/weight", updateWeight);

module.exports = router;