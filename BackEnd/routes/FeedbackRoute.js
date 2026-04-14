const express = require("express");
const router = express.Router();
const feedbackController = require("../controller/FeedbackController");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Public routes
router.get("/public", feedbackController.getPublicFeedback);

// Protected routes (logged in users)
router.post("/", auth, feedbackController.createFeedback);

// Admin routes
router.get("/all", adminAuth, feedbackController.getAllFeedback);
router.put("/:id/status", adminAuth, feedbackController.updateFeedbackStatus);
router.delete("/:id", adminAuth, feedbackController.deleteFeedback);

module.exports = router;

