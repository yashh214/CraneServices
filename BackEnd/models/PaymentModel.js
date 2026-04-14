const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: "Online" },
    status: { type: String, enum: ["Paid", "Pending", "Failed"], default: "Paid" },
    paidAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
