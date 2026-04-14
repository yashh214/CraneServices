const Contact = require("../models/ContactModel");

// Create a new contact inquiry
const createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, serviceType, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !serviceType || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newContact = new Contact({
      firstName,
      lastName,
      email,
      phone,
      serviceType,
      message
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We will get back to you shortly.",
      data: newContact
    });

  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Get all contact inquiries (for admin)
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });

  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Get single contact by ID
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Update contact status
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'contacted', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: contact
    });

  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Delete contact
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
};

