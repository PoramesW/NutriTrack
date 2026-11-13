
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
