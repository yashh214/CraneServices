const express = require("express");
const router = express.Router();
const statsController = require("../controller/StatsController");

// Get all statistics (public)
router.get("/", statsController.getStats);

module.exports = router;

