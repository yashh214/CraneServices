const Booking = require("../models/BookingModel");
const Payment = require("../models/PaymentModel");

/**
 * Create a new booking. user is pulled from auth middleware (req.user.userId)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      pickupAddress,
      destination,
      craneType,
      location,
      date,
      hours,
      description,
      amount,
      paymentMethod
    } = req.body;

    const booking = await Booking.create({
      user: req.user.userId,
      name,
      phone,
      email,
      pickupAddress,
      destination,
      craneType,
      location,
      date,
      hours,
      description,
      amount,
      paymentMethod
    });

    // if an amount was provided, create a corresponding payment record
    if (amount) {
      try {
        // remove any non-digit or decimal characters (₹, commas, spaces)
        const numericAmount = parseFloat(
          String(amount).replace(/[^0-9.]/g, "")
        );
        await Payment.create({
          user: req.user.userId,
          booking: booking._id,
          amount: isNaN(numericAmount) ? 0 : numericAmount,
          method: paymentMethod || req.body.method || "Online",
          status: "Paid"
        });
      } catch (err) {
        console.error("Failed to create payment record", err);
      }
    }

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all bookings for the currently logged-in user
 */
exports.getUserBookings = async (req, res) => {
  try {
    // Skip if userId is "admin-static" (static admin doesn't have bookings)
    if (req.user.userId === "admin-static") {
      return res.json({ bookings: [] });
    }
    
    const bookings = await Booking.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * (Optional) Get all bookings - admin
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Update booking status (Complete)
 */
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    booking.status = "Completed";
    await booking.save();
    
    res.json({ message: "Booking marked as completed", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Update booking status (Cancel)
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Prevent canceling already completed bookings
    if (booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot cancel a completed booking" });
    }
    
    booking.status = "Cancelled";
    booking.cancellationReason = reason || "Cancelled by admin";
    booking.cancelledAt = new Date();
    await booking.save();
    
    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * User: Cancel their own booking
 */
exports.userCancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findOne({ _id: id, user: req.user.userId });
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }
    
    // Prevent canceling already completed or cancelled bookings
    if (booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot cancel a completed booking" });
    }
    
    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    
    booking.status = "Cancelled";
    booking.cancellationReason = reason || "Cancelled by user";
    booking.cancelledAt = new Date();
    await booking.save();
    
    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
