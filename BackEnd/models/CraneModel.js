const mongoose = require("mongoose");

const CraneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    capacity: { type: String, required: true },
    hourlyRate: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    availability: { type: Boolean, default: true },
    location: { type: String },
    registrationNo: { type: String },
    maintenanceStatus: { type: String, enum: ["Good", "Fair", "Poor"], default: "Good" },
    lastMaintenance: { type: Date },
    notes: { type: String },
    // Virtual field for busy hours (calculated from bookings)
    busyHours: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crane", CraneSchema);
