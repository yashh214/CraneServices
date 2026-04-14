const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['crane_booking', 'emergency_service', 'general_inquiry']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'contacted', 'resolved']
  }
}, {
  timestamps: true
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;

