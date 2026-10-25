
const express = require("express");
const router = express.Router();

const {
  getWorkouts,
  addWorkout,
  deleteWorkout,
  getWorkoutSummary,
} = require("../controllers/workout.controller");

router.get("/summary", getWorkoutSummary);
router.get("/", getWorkouts);
router.post("/", addWorkout);
router.delete("/:id", deleteWorkout);

module.exports = router;
