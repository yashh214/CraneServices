const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    pickupAddress: { type: String },
    destination: { type: String },
    craneType: { type: String, required: true },
    location: { type: String },
    date: { type: Date, required: true },
    hours: { type: Number, required: true },
    description: { type: String },
    amount: { type: String },
    paymentMethod: { type: String },
    trackingId: { type: String, unique: true },
    status: { type: String, enum: ["Confirmed", "In Progress", "Completed", "Cancelled"], default: "Confirmed" },
    cancellationReason: { type: String },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

// generate a simple tracking id before saving
BookingSchema.pre("save", function (next) {
  if (!this.trackingId) {
    this.trackingId = `GCS${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
