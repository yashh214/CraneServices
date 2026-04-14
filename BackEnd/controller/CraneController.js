const Crane = require("../models/CraneModel");
const Booking = require("../models/BookingModel");

/**
 * Admin: Create a new crane
 */
exports.createCrane = async (req, res) => {
  try {
    const { name, type, capacity, hourlyRate, description, location, registrationNo, notes } = req.body;

    if (!name || !type || !capacity || hourlyRate == null) {
      return res.status(400).json({ message: "Missing required fields: name, type, capacity, hourlyRate" });
    }

    // Handle image upload - multer adds file to req.file
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const crane = await Crane.create({
      name,
      type,
      capacity,
      hourlyRate,
      description,
      image: imageUrl,
      location,
      registrationNo,
      notes,
      availability: true
    });

    res.status(201).json({ message: "Crane added successfully", crane });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Get all cranes (with busy hours calculation)
 */
exports.getAllCranes = async (req, res) => {
  try {
    const cranes = await Crane.find().sort({ createdAt: -1 });
    
    // Calculate busy hours for each crane based on active bookings
    const cranesWithBusyHours = await Promise.all(
      cranes.map(async (crane) => {
        const craneObj = crane.toObject();
        
        // Find active bookings for this crane (not completed/cancelled)
        const activeBookings = await Booking.find({
          craneType: crane._id.toString(),
          status: { $in: ["Confirmed", "In Progress"] }
        });
        
        // Calculate total busy hours
        let totalBusyHours = 0;
        activeBookings.forEach(booking => {
          if (booking.hours) {
            totalBusyHours += booking.hours;
          }
        });
        
        craneObj.busyHours = totalBusyHours;
        craneObj.isAvailable = totalBusyHours === 0;
        
        return craneObj;
      })
    );
    
    res.json({ cranes: cranesWithBusyHours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Get crane by ID
 */
exports.getCraneById = async (req, res) => {
  try {
    const crane = await Crane.findById(req.params.id);
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }
    res.json({ crane });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Update crane
 */
exports.updateCrane = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, hourlyRate, description, location, registrationNo, availability, maintenanceStatus, lastMaintenance, notes } = req.body;

    const crane = await Crane.findById(id);
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    // Handle image upload - multer adds file to req.file
    if (req.file) {
      crane.image = `/uploads/${req.file.filename}`;
    }

    if (name) crane.name = name;
    if (type) crane.type = type;
    if (capacity) crane.capacity = capacity;
    if (hourlyRate != null) crane.hourlyRate = hourlyRate;
    if (description) crane.description = description;
    if (location) crane.location = location;
    if (registrationNo) crane.registrationNo = registrationNo;
    if (availability != null) crane.availability = availability;
    if (maintenanceStatus) crane.maintenanceStatus = maintenanceStatus;
    if (lastMaintenance) crane.lastMaintenance = lastMaintenance;
    if (notes) crane.notes = notes;

    await crane.save();
    res.json({ message: "Crane updated successfully", crane });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Delete crane (soft delete)
 */
exports.deleteCrane = async (req, res) => {
  try {
    const crane = await Crane.findByIdAndDelete(req.params.id);
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }
    res.json({ message: "Crane deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: Toggle crane availability
 */
exports.toggleCraneAvailability = async (req, res) => {
  try {
    const crane = await Crane.findById(req.params.id);
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    crane.availability = !crane.availability;
    await crane.save();

    res.json({ 
      message: `Crane is now ${crane.availability ? "available" : "unavailable"}`, 
      crane 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
