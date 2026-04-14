import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupAPI } from "../services/api";
import { validateField, validatePasswordMatch } from "../utils/validation";
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaPhone } from "react-icons/fa";
import logo from  "../../src/Images/Ganeshlogo.jpeg"
import "./Login.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
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
      case "name":
        validationResult = validateField(value, "Name", { required: true, name: true, minLength: 2, maxLength: 50 });
        break;
      case "email":
        validationResult = validateField(value, "Email", { required: true, email: true });
        break;
      case "phone":
        if (value) {
          validationResult = validateField(value, "Phone", { indianPhone: true });
        }
        break;
      case "password":
        validationResult = validateField(value, "Password", { required: true, password: true });
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

    // Validate name
    const nameResult = validateField(formData.name, "Name", { required: true, name: true, minLength: 2, maxLength: 50 });
    if (!nameResult.isValid) {
      newErrors.name = nameResult.error;
      isValid = false;
    }

    // Validate email
    const emailResult = validateField(formData.email, "Email", { required: true, email: true });
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error;
      isValid = false;
    }

    // Validate phone (optional but if provided, must be valid)
    if (formData.phone) {
      const phoneResult = validateField(formData.phone, "Phone", { indianPhone: true });
      if (!phoneResult.isValid) {
        newErrors.phone = phoneResult.error;
        isValid = false;
      }
    }

    // Validate password
    const passwordResult = validateField(formData.password, "Password", { required: true, password: true });
    if (!passwordResult.isValid) {
      newErrors.password = passwordResult.error;
      isValid = false;
    }

    // Validate password match
    const passwordMatchResult = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!passwordMatchResult.isValid) {
      newErrors.confirmPassword = passwordMatchResult.error;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage("");

    // Validate form using centralized validation
    if (!validateForm()) {
      setError(true);
      setErrorMessage("Please fix the validation errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      await signupAPI(formData.name, formData.email, formData.password);
      
      setSuccess(true);

      setTimeout(() => {
        navigate("/Login");
      }, 1500);
    } catch (err) {
      setError(true);
      setErrorMessage(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className={`login-card ${error ? "shake" : ""}`}>
        
        {/* Signup Header with Logo */}
        <div className="login-header">
          <img src={logo} alt="Ganesh Crane Services" className="login-logo-img" />
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Join Ganesh Crane Services</p>
        </div>

        {success && (
          <div className="success-popup">
            ✓ Registration Successful! Redirecting to Login...
          </div>
        )}

        {error && (
          <div className="error-message" style={{ 
            color: '#ef4444', 
            marginBottom: '15px', 
            textAlign: 'center',
            padding: '10px',
            backgroundColor: '#fee2e2',
            borderRadius: '5px'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="input-box floating">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Full Name</label>
          </div>

          {/* Email Input */}
          <div className="input-box floating">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Email address</label>
          </div>

          {/* Phone Input */}
          <div className="input-box floating">
            <FaPhone className="input-icon" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder=" "
            />
            <label>Phone Number (Optional)</label>
          </div>

          {/* Password Input */}
          <div className="input-box floating">
            <FaLock className="input-icon" />
            <input
              type={showPass ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Password</label>

            <span
              className="eye-icon"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password Input */}
          <div className="input-box floating">
            <FaLock className="input-icon" />
            <input
              type={showPass ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Confirm Password</label>
          </div>

          {/* Signup Button */}
          <button className="login-btn" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <div className="signup-link" style={{ 
          textAlign: 'center', 
          marginTop: '15px' 
        }}>
          <p>Already have an account? <Link to="/Login" style={{ color: '#facc15' }}>Sign In</Link></p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
