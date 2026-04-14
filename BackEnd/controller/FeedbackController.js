const Feedback = require("../models/FeedbackModel");
const User = require("../models/UserModel");

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, company, rating, comment } = req.body;
    const userId = req.user ? req.user.userId : null;
    
    // Build feedback data object
    const feedbackData = {
      name,
      company: company || "",
      rating,
      comment
    };
    
    // Only add userId if it exists
    if (userId) {
      feedbackData.userId = userId;
    }
    
    const feedback = new Feedback(feedbackData);
    await feedback.save();
    
    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

// Get all feedback (public - only approved)
exports.getPublicFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

// Get all feedback (admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

// Update feedback approval status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    ).populate("userId", "name email");
    
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    
    res.json({
      message: "Feedback status updated",
      feedback
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Failed to update feedback" });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findByIdAndDelete(id);
    
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Failed to delete feedback" });
  }
};

