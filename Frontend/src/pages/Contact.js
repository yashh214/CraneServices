import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";
import { createContactAPI } from "../services/api";
import { validateField } from "../utils/validation";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheck, FaTimes } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Company location coordinates (Chaugaon, Dhule, Maharashtra)
const COMPANY_LOCATION = [20.8967, 74.7719];

// Custom marker icon
const companyIcon = L.divIcon({
  className: 'cnt-custom-marker',
  html: `<div style="background-color: var(--cnt-violet); width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--cnt-white); box-shadow: var(--cnt-shadow-sm); display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--cnt-white);">🏢</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setSuccess("");
    setError("");

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate single field on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let validationResult;

    switch (name) {
      case "firstName":
        validationResult = validateField(value, "First Name", { required: true, name: true, minLength: 2, maxLength: 50 });
        break;
      case "lastName":
        validationResult = validateField(value, "Last Name", { required: true, name: true, minLength: 2, maxLength: 50 });
        break;
      case "email":
        validationResult = validateField(value, "Email", { required: true, email: true });
        break;
      case "phone":
        validationResult = validateField(value, "Phone", { required: true, indianPhone: true });
        break;
      case "message":
        validationResult = validateField(value, "Message", { required: true, minLength: 10, maxLength: 1000 });
        break;
      default:
        break;
    }

    if (validationResult && !validationResult.isValid) {
      setErrors(prev => ({ ...prev, [name]: validationResult.error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate first name
    const firstNameResult = validateField(formData.firstName, "First Name", { required: true, name: true, minLength: 2, maxLength: 50 });
    if (!firstNameResult.isValid) {
      newErrors.firstName = firstNameResult.error;
      isValid = false;
    }

    // Validate last name
    const lastNameResult = validateField(formData.lastName, "Last Name", { required: true, name: true, minLength: 2, maxLength: 50 });
    if (!lastNameResult.isValid) {
      newErrors.lastName = lastNameResult.error;
      isValid = false;
    }

    // Validate email
    const emailResult = validateField(formData.email, "Email", { required: true, email: true });
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error;
      isValid = false;
    }

    // Validate phone
    const phoneResult = validateField(formData.phone, "Phone", { required: true, indianPhone: true });
    if (!phoneResult.isValid) {
      newErrors.phone = phoneResult.error;
      isValid = false;
    }

    // Validate service type
    if (!formData.serviceType) {
      newErrors.serviceType = "Please select a service type";
      isValid = false;
    }

    // Validate message
    const messageResult = validateField(formData.message, "Message", { required: true, minLength: 10, maxLength: 1000 });
    if (!messageResult.isValid) {
      newErrors.message = messageResult.error;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!validateForm()) {
      setError("Please fix the validation errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      const response = await createContactAPI(formData);
      setSuccess(response.message || "Thank you for contacting us! We will get back to you shortly.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        serviceType: "",
        message: ""
      });
    } catch (err) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: FaPhone,
      title: "Phone",
      detail: "+91 98765 43210",
      subdetail: "Available 24/7",
      link: "tel:+919876543210"
    },
    {
      icon: FaEnvelope,
      title: "Email",
      detail: "ganeshcrane@gmail.com",
      subdetail: "We reply within 24 hours",
      link: "mailto:ganeshcrane@gmail.com"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Address",
      detail: "Ganesh Crane Service",
      subdetail: "National Highway No.3, Chalisgaon Road, Chaugaon, Dhule, Maharashtra - 424311",
      link: null
    },
    {
      icon: FaClock,
      title: "Business Hours",
      detail: "24/7 Emergency",
      subdetail: "Always available",
      link: null
    }
  ];

  const services = [
    { value: "crane_booking", label: "Crane Booking" },
    { value: "emergency_service", label: "Emergency Service" },
    { value: "general_inquiry", label: "General Inquiry" }
  ];

  return (
    <div className="cnt-wrapper">
      {/* Hero */}
      <section className="cnt-hero-section">
        <div className="cnt-hero-overlay"></div>
        <div className="cnt-hero-content">
          <div className="cnt-hero-badge">Get In Touch</div>
          <h1 className="cnt-hero-title">
            Contact <span className="cnt-hero-highlight">Us</span>
          </h1>
          <p className="cnt-hero-subtitle">
            Have a project in mind? Let's discuss your heavy lifting requirements
          </p>
        </div>
      </section>

      {/* Cards */}

<section className="cnt-contact-cards-section">
        <div className="cnt-main-container">
          <div className="cnt-section-header">
            <span className="cnt-section-badge">Contact Info</span>
            <h2 className="cnt-section-title">Get In Touch</h2>
          </div>
          <div className="cnt-contact-cards-grid">
            {contactInfo.map((info, index) => (
              <div className="cnt-contact-card" key={index}>
                <div className="cnt-contact-card-icon">{React.createElement(info.icon)}</div>
                <h3 className="cnt-contact-card-title">{info.title}</h3>
                {info.link ? (
                  <a href={info.link} className="cnt-contact-card-detail">{info.detail}</a>
                ) : (
                  <p className="cnt-contact-card-detail">{info.detail}</p>
                )}
                <span className="cnt-contact-card-subdetail">{info.subdetail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Grid */}
      <section className="cnt-grid-section">
        <div className="cnt-main-container">
          <div className="cnt-grid">
            {/* Form */}
            <div className="cnt-form-section">
              <div className="cnt-form-header">
                <h2 className="cnt-form-title">Send Message</h2>
                <p className="cnt-form-subtitle">Fill out the form - we reply within 24 hours</p>
              </div>

              {success && (
                <div className="cnt-alert cnt-alert-success">
                  <FaCheck />
                  {success}
                </div>
              )}
              {error && (
                <div className="cnt-alert cnt-alert-error">
                  <FaTimes />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="cnt-form">
                <div className="cnt-form-row">
                  <div className={`cnt-form-group ${errors.firstName && 'error'}`}>
                    <label>First Name *</label>
                    <input 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="First Name"
                    />
                    {errors.firstName && <span>{errors.firstName}</span>}
                  </div>
                  <div className={`cnt-form-group ${errors.lastName && 'error'}`}>
                    <label>Last Name *</label>
                    <input 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Last Name"
                    />
                    {errors.lastName && <span>{errors.lastName}</span>}
                  </div>
                </div>

                <div className="cnt-form-row">
                  <div className={`cnt-form-group ${errors.email && 'error'}`}>
                    <label>Email *</label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="your@email.com"
                    />
                    {errors.email && <span>{errors.email}</span>}
                  </div>
                  <div className={`cnt-form-group ${errors.phone && 'error'}`}>
                    <label>Phone *</label>
                    <input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+91 XXXXX XXXXX"
                    />
                    {errors.phone && <span>{errors.phone}</span>}
                  </div>
                </div>

                <div className="cnt-service-section">
                  <label>Service Required *</label>
                  <div className="cnt-service-options">
                    {services.map((service) => (
                      <label 
                        key={service.value} 
                        className={`cnt-service-option ${formData.serviceType === service.value ? 'selected' : ''}`}
                      >
                        <input 
                          type="radio" 
                          name="serviceType" 
                          value={service.value}
                          onChange={handleChange}
                        />
                        {service.label}
                      </label>
                    ))}
                  </div>
                  {errors.serviceType && <span>{errors.serviceType}</span>}
                </div>

                <div className={`cnt-form-group ${errors.message && 'error'}`}>
                  <label>Message *</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows="4"
                    placeholder="Tell us about your project..."
                  ></textarea>
                  {errors.message && <span>{errors.message}</span>}
                </div>

                <button type="submit" className="cnt-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="cnt-sidebar">
              <div className="cnt-sidebar-card cnt-map-card">
                <h3 className="cnt-sidebar-title">Find Us</h3>
                <div style={{height: '250px', borderRadius: '20px', overflow: 'hidden'}}>
                  <MapContainer 
                    center={COMPANY_LOCATION} 
                    zoom={15} 
                    style={{height: '100%', width: '100%'}}
                    scrollWheelZoom={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={COMPANY_LOCATION} icon={companyIcon}>
                      <Popup>Ganesh Crane Service<br/>Chaugaon, Dhule</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>

              <div className="cnt-sidebar-card">
                <h3 className="cnt-sidebar-title">Quick Links</h3>
                <ul>
                  <li><Link to="/Bookcrane">Book Crane</Link></li>
                  <li><Link to="/About">About</Link></li>
                  <li><Link to="/feedback">Feedback</Link></li>
                </ul>
              </div>

              <div className="cnt-emergency-banner">
                <div className="cnt-emergency-icon">🚨</div>
                <h3>24/7 Emergency</h3>
                <a href="tel:+919876543210" className="cnt-btn">Call Now</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
