const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Import controller
const contactController = require("../controller/ContactController");

// Public route - Create a new contact inquiry
router.post("/", contactController.createContact);

// Protected routes - Admin only
router.get("/all", auth, adminAuth, contactController.getAllContacts);
router.get("/:id", auth, adminAuth, contactController.getContactById);
router.put("/:id/status", auth, adminAuth, contactController.updateContactStatus);
router.delete("/:id", auth, adminAuth, contactController.deleteContact);

module.exports = router;

