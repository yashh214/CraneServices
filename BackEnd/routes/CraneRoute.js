const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const craneController = require("../controller/CraneController");
const upload = require("../middleware/upload");

// Get all cranes (public)
router.get("/", craneController.getAllCranes);

// Get crane by ID (public)
router.get("/:id", craneController.getCraneById);

// Admin routes - with image upload support
router.post("/", auth, adminAuth, upload.single("image"), craneController.createCrane);
router.put("/:id", auth, adminAuth, upload.single("image"), craneController.updateCrane);
router.delete("/:id", auth, adminAuth, craneController.deleteCrane);
router.patch("/:id/toggle-availability", auth, adminAuth, craneController.toggleCraneAvailability);

module.exports = router;
