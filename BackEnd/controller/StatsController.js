const Crane = require("../models/CraneModel");
const Booking = require("../models/BookingModel");
const User = require("../models/UserModel");

/**
 * Get all statistics for the dashboard/public view
 */
exports.getStats = async (req, res) => {
  try {
    // Get total cranes count
    const craneCount = await Crane.countDocuments();

    // Get completed projects count (bookings with status "Completed")
    const completedProjects = await Booking.countDocuments({ status: "Completed" });

    // Get happy customers count (total users)
    const happyCustomers = await User.countDocuments();

    res.json({
      craneFleet: craneCount,
      projectsCompleted: completedProjects,
      happyCustomers: happyCustomers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

