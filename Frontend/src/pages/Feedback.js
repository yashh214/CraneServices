import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createFeedbackAPI } from "../services/api";
import "./Feedback.css";
import { FaStar, FaPaperPlane, FaCheck } from "react-icons/fa";

function Feedback() {
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    company: "",
    rating: 5,
    comment: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setSuccess("");
    setError("");
  };

  const handleStarClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert("Please login to submit feedback");
      navigate("/Login");
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await createFeedbackAPI(formData, token);
      setSuccess(response.message || "Thank you for your feedback!");
      setFormData({
        name: user?.name || "",
        company: "",
        rating: 5,
        comment: ""
      });
    } catch (err) {
      setError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="feedback-page">
        <div className="feedback-container">
          <div className="login-required-card">
            <div className="login-icon">🔐</div>
            <h2>Login Required</h2>
            <p>Please login to submit your feedback</p>
            <button onClick={() => navigate("/Login")} className="login-btn">
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-hero">
        <div className="hero-content">
          <span className="hero-badge">Your Feedback</span>
          <h1>Share Your <span className="highlight">Experience</span></h1>
          <p>Help us improve our services by sharing your experience with Ganesh Crane Services.</p>
        </div>
      </div>

      <div className="feedback-container">
        <div className="feedback-card">
          <div className="card-header">
            <h2>Submit Your Feedback</h2>
            <p>Your feedback helps us serve you better</p>
          </div>

          {success && (
            <div className="alert success">
              <FaCheck className="alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label>Your Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Company (Optional)</label>
              <input 
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter your company name"
              />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= (hoveredStar || formData.rating) ? 'active' : ''}`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  >
                    <FaStar />
                  </button>
                ))}
                <span className="rating-text">
                  {formData.rating === 5 ? "Excellent" : 
                   formData.rating === 4 ? "Very Good" : 
                   formData.rating === 3 ? "Good" : 
                   formData.rating === 2 ? "Fair" : "Poor"}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Your Feedback *</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Tell us about your experience with our crane services..."
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>

        <div className="feedback-info">
          <div className="info-card">
            <h3>Why Your Feedback Matters</h3>
            <ul>
              <li>Help us improve our services</li>
              <li>Shape the future of our company</li>
              <li>Assist other customers in making decisions</li>
              <li>Get recognized for your valued opinion</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>What Happens Next?</h3>
            <ul>
              <li>Your feedback is reviewed by our team</li>
              <li>Your feedback appears on our website immediately</li>
              <li>We use your input to improve operations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;

