const Payment = require("../models/PaymentModel");

/**
 * Create a payment record. Typically called after a booking is created.
 * Expects bookingId and amount in body; user is pulled from auth middleware.
 */
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;
    if (!bookingId || amount == null) {
      return res.status(400).json({ message: "bookingId and amount are required" });
    }

    const payment = await Payment.create({
      user: req.user.userId,
      booking: bookingId,
      amount,
      method,
      status: "Paid"
    });

    res.status(201).json({ message: "Payment recorded", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: return all payment records with user and booking populated.
 */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("booking", "trackingId craneType date amount")
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: aggregate total paid amount per user.
 */
exports.getPaymentTotals = async (req, res) => {
  try {
    const totals = await Payment.aggregate([
      { $group: { _id: "$user", total: { $sum: "$amount" } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          total: 1
        }
      }
    ]);

    res.json({ totals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get payments for a specific user (admin or the user themselves)
 */
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.params.id || req.user.userId;
    // if requesting another user's payments, must be admin
    if (req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    const payments = await Payment.find({ user: userId })
      .populate("booking", "trackingId craneType date amount")
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
