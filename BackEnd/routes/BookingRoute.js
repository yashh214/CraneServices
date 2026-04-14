const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const controller = require("../controller/BookingController");

// create booking (user must be logged in)
router.post("/book", auth, controller.createBooking);

// get bookings for current user
router.get("/my", auth, controller.getUserBookings);

// admin only
router.get("/all", auth, adminAuth, controller.getAllBookings);

// admin: update booking status
router.patch("/:id/complete", auth, adminAuth, controller.completeBooking);
router.patch("/:id/cancel", auth, adminAuth, controller.cancelBooking);

// User: cancel their own booking (different path to avoid conflict)
router.patch("/my/:id/cancel", auth, controller.userCancelBooking);

module.exports = router;

