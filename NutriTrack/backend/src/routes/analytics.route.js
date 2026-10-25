
const express = require("express");
const router = express.Router();

const {
  getDashboard,
} = require("../controllers/analytics.controller");

router.post("/dashboard", getDashboard);

module.exports = router;
