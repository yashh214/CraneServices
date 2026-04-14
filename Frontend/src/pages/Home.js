import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { getAllCranesAPI, getStatsAPI, getPublicFeedbackAPI } from "../services/api";
import Hydra from "../Images/craneheader.jpeg"
// Placeholder image for cranes without images
const placeholderCrane = "https://via.placeholder.com/400x300?text=No+Image+Available";

function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projectsCompleted: 0, craneFleet: 0, happyCustomers: 0 });
  const [testimonials, setTestimonials] = useState([]);

  // Slide images will be loaded from first available cranes or use defaults
  const slides = [
    {
      // image: Hydra,
      heading: "Ganesh Crane Services",
      highlight: "24/7",
      subheading: "Safe. Strong. Trusted."
    },
  ];

  const services = [
    {
      icon: "🏗️",
      title: "Mobile Crane",
      description: "Versatile cranes for construction sites and industrial projects"
    },
    {
      icon: "🔧",
      title: "Hydra Crane",
      description: "Heavy-duty lifting solutions for manufacturing and assembly"
    },
    {
      icon: "⚙️",
      title: "Heavy Lifting",
      description: "Industrial-grade lifting for complex machinery and structures"
    }
  ];

  const features = [
    {
      icon: "🛡️",
      title: "Safety First",
      description: "Strict safety protocols and regular equipment inspections"
    },
    {
      icon: "💼",
      title: "Years of Experience",
      description: "Decades of expertise in heavy lifting operations"
    },
    {
      icon: "✅",
      title: "Certified Operators",
      description: "IS & ANSI certified professionals with rigorous training"
    },
    {
      icon: "⚡",
      title: "Fast Response",
      description: "24/7 emergency dispatch with rapid deployment"
    }
  ];

  // Fetch cranes from database only (no static data)
  useEffect(() => {
    const fetchCranes = async () => {
      try {
        setLoading(true);
        const data = await getAllCranesAPI();
        if (data && data.cranes && data.cranes.length > 0) {
          // Get available cranes from database
          const dbCranes = data.cranes
            .filter(crane => crane.availability !== false)
            .map(crane => ({
              name: crane.name,
              capacity: crane.capacity,
              image: crane.image ? `http://localhost:8000${crane.image}` : placeholderCrane,
              isFromDB: true
            }));
          
          setCranes(dbCranes);
        } else {
          // No database cranes - show empty state message
          setCranes([]);
        }
      } catch (error) {
        console.error("Error fetching cranes:", error);
        setCranes([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const data = await getStatsAPI();
        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    // Fetch testimonials from feedback API
    const fetchTestimonials = async () => {
      try {
        const data = await getPublicFeedbackAPI();
        if (data && data.length > 0) {
          // Transform feedback data to testimonial format
          const formattedTestimonials = data.map(item => ({
            name: item.name,
            company: item.company || "Valued Customer",
            text: item.comment,
            rating: "⭐".repeat(item.rating)
          }));
          setTestimonials(formattedTestimonials);
        }
        // If no testimonials, keep the default ones
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Keep empty array on error
      }
    };

    fetchCranes();
    fetchStats();
    fetchTestimonials();
  }, []);

  // Gallery uses crane images from database
  const gallery = cranes.length > 0 ? cranes.slice(0, 8).map(c => c.image) : [];

  // Use dynamic testimonials if available, otherwise show empty state
  const displayTestimonials = testimonials.length > 0 ? testimonials : [];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="vps-home-wrapper">
      {/* HERO SLIDER SECTION */}
      <section className="vps-hero-section">
        <div className="vps-slider-container">
          {slides.map((slide, index) => (
            <div 
              className={`vps-slide-item ${index === currentSlide ? 'vps-slide-active' : ''}`}
              key={index}
            >
              <div className="vps-slide-bg" style={{ backgroundImage: `url(${slide.image})` }}></div>
              <div className="vps-slide-overlay"></div>
              <div className="vps-slide-content">
                <h1 className="vps-hero-title">
                  {slide.heading} <span className="vps-hero-highlight">{slide.highlight}</span>
                </h1>
                <p className="vps-hero-subtitle">{slide.subheading}</p>
                <div className="vps-hero-buttons">
                  <a href="tel:+919876543210" className="vps-btn vps-btn-primary">
                    📞 Call Now
                  </a>
                  <button 
                    onClick={() => navigate("/Bookcrane")} 
                    className="vps-btn vps-btn-secondary"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="vps-services-section">
        <div className="vps-main-container">
          <div className="vps-section-header">
            <span className="vps-section-badge">Our Services</span>
            <h2 className="vps-section-title">Comprehensive Crane Solutions</h2>
            <p className="vps-section-subtitle">
              From small-scale lifts to massive industrial projects, we have the equipment and expertise to handle it all.
            </p>
          </div>
          <div className="vps-services-grid">
            {services.map((service, index) => (
              <div className="vps-service-card" key={index}>
                <div className="vps-service-icon">{service.icon}</div>
                <h3 className="vps-service-title">{service.title}</h3>
                <p className="vps-service-description">{service.description}</p>
                <button 
                  className="vps-service-link"
                  onClick={() => navigate("/Bookcrane")}
                >
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="vps-features-section">
        <div className="vps-main-container">
          <div className="vps-section-header vps-light-theme">
            <span className="vps-section-badge">Why Choose Us</span>
            <h2 className="vps-section-title">Excellence in Every Lift</h2>
          </div>
          <div className="vps-features-grid">
            {features.map((feature, index) => (
              <div className="vps-feature-card" key={index}>
                <div className="vps-feature-icon">{feature.icon}</div>
                <h3 className="vps-feature-title">{feature.title}</h3>
                <p className="vps-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="vps-testimonials-section">
        <div className="vps-main-container">
          <div className="vps-section-header">
            <span className="vps-section-badge">Testimonials</span>
            <h2 className="vps-section-title">What Our Clients Say</h2>
          </div>
          {displayTestimonials.length > 0 ? (
            <div className="vps-testimonials-grid">
              {displayTestimonials.map((testimonial, index) => (
                <div className="vps-testimonial-card" key={index}>
                  <div className="vps-testimonial-rating">{testimonial.rating}</div>
                  <p className="vps-testimonial-author">{testimonial.text}</p>
                  <div className="vps-testimonial-author">
                    <div className="vps-author-avatar">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="vps-author-info">
                      <span className="vps-author-name">{testimonial.name}</span>
                      <span className="vps-author-company">{testimonial.company}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>No testimonials yet</p>
              <p style={{ fontSize: '14px' }}>Be the first to share your experience with us!</p>
            </div>
          )}
        </div>
      </section>

      {/* EMERGENCY CONTACT BANNER */}
      <section className="vps-emergency-banner">
        <div className="vps-main-container">
          <div className="vps-emergency-content">
            <div className="vps-emergency-icon">🚨</div>
            <div className="vps-emergency-text">
              <h3>24/7 Emergency Crane Service</h3>
              <p>Need immediate assistance? Our team is available round the clock.</p>
            </div>
            <a href="tel:+919876543210" className="vps-emergency-btn">
              📞 +91 98765 43210
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
