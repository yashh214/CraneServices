import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";
import { getStatsAPI } from "../services/api";
import craneheader from "../Images/craneheader.jpeg";

function About() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    craneFleet: 0,
    projectsCompleted: 0,
    happyCustomers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatsAPI();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const statsData = [
    {
      icon: "📅",
      number: "25+",
      label: "Years Experience"
    },
    {
      icon: "🏆",
      number: `${stats.projectsCompleted || 0}+`,
      label: "Projects Completed"
    },
    {
      icon: "🚛",
      number: `${stats.craneFleet || 0 }+`,
      label: "Crane Fleet"
    },
    {
      icon: "👥",
      number: `${stats.happyCustomers || 0}+`,
      label: "Happy Clients"
    }
  ];

  const missions = [
    {
      icon: "🎯",
      title: "Our Mission",
      desc: "To deliver safe and efficient crane services with modern equipment and trained operators, ensuring customer satisfaction every time. We strive to be the most reliable partner for all heavy lifting requirements in the region."
    },
    {
      icon: "👁️",
      title: "Our Vision",
      desc: "To be the leading crane service provider in Dhule, known for safety, reliability, and innovation. We aim to set industry standards while maintaining our commitment to excellence and customer-focused solutions."
    }
  ];

  const features = [
    {
      icon: "🛡️",
      title: "Safety First",
      desc: "Strict safety protocols and regular equipment inspections ensure zero accidents."
    },
    {
      icon: "⏰",
      title: "24/7 Availability",
      desc: "Round-the-clock emergency services for urgent project requirements."
    },
    {
      icon: "✅",
      title: "Certified Operators",
      desc: "IS & ANSI certified professionals with rigorous training and expertise."
    },
    {
      icon: "💰",
      title: "Competitive Pricing",
      desc: "Transparent pricing with no hidden costs. Value for your investment."
    }
  ];

  const timeline = [
    {
      year: "1998",
      icon: "🚀",
      title: "The Beginning",
      text: "Founded Ganesh Crane Services with a single crane and a vision to revolutionize heavy lifting in Dhule."
    },
    {
      year: "2005",
      icon: "📈",
      title: "Expanding Horizons",
      text: "Expanded fleet to 8 cranes and started serving major industrial clients across Dhule."
    },
    {
      year: "2015",
      icon: "🏆",
      title: "Industry Recognition",
      text: "Received multiple awards for safety excellence and customer satisfaction in the crane industry."
    },
    {
      year: "2024",
      icon: "🌟",
      title: "Leading the Way",
      text: "Now with 8+ cranes and 100+ satisfied clients, we continue to set benchmarks in crane services."
    }
  ];

  return (
    <div className="aba-about-wrapper">
      {/* HERO SECTION */}
      <section className="aba-hero-section">
        <div className="aba-hero-overlay"></div>
        <div className="aba-hero-content">
          <div className="aba-hero-badge">Since 1998</div>
          <h1 className="aba-hero-title">
            About Ganesh Crane <span className="aba-hero-highlight">Services</span>
          </h1>
          <p className="aba-hero-subtitle">
            Trusted leader in heavy lifting and crane solutions across Maharashtra
          </p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="aba-stats-section">
        <div className="aba-main-container">
          <div className="aba-section-header">
            <span className="aba-section-badge">Our Achievements</span>
            <h2 className="aba-section-title">Numbers Speak Louder</h2>
            <p className="aba-section-subtitle">
              Decades of excellence in heavy lifting solutions
            </p>
          </div>
          <div className="aba-stats-grid">
            {statsData.map((stat, index) => (
              <div className="aba-stat-card" key={index}>
                <div className="aba-stat-icon">{stat.icon}</div>
                <div className="aba-stat-number">{stat.number}</div>
                <div className="aba-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION/VISION */}
      <section className="aba-mission-section">
        <div className="aba-main-container">
          <div className="aba-mission-grid">
            {missions.map((mission, index) => (
              <div className="aba-mission-card" key={index}>
                <div className="aba-mission-icon">{mission.icon}</div>
                <h3 className="aba-mission-title">{mission.title}</h3>
                <p className="aba-mission-desc">{mission.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="aba-features-section">
        <div className="aba-main-container">
          <div className="aba-section-header">
            <span className="aba-section-badge">Why Choose Us</span>
            <h2 className="aba-section-title">The Ganesh Advantage</h2>
          </div>
          <div className="aba-features-grid">
            {features.map((feature, index) => (
              <div className="aba-feature-card" key={index}>
                <div className="aba-feature-icon">{feature.icon}</div>
                <h3 className="aba-feature-title">{feature.title}</h3>
                <p className="aba-feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="aba-timeline-section">
        <div className="aba-main-container">
          <div className="aba-section-header">
            <span className="aba-section-badge">Our Journey</span>
            <h2 className="aba-section-title">Milestones & Achievements</h2>
          </div>
          <div className="aba-timeline-grid">
            {timeline.map((item, index) => (
              <div className="aba-timeline-card" data-year={item.year} key={index}>
                <div className="aba-timeline-marker">{item.icon}</div>
                <h4 className="aba-timeline-title">{item.title}</h4>
                <p className="aba-timeline-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="aba-cta-banner">
        <div className="aba-main-container">
          <div className="aba-cta-content">
            <div className="aba-cta-icon">🤝</div>
            <div className="aba-cta-text">
              <h3 className="aba-cta-title">Ready to Work With Us?</h3>
              <p className="aba-cta-subtitle">
                Whether you need crane rental, heavy lifting, or specialized transport services
              </p>
            </div>
            <div className="aba-cta-buttons">
              <button 
                className="aba-btn aba-btn-primary"
                onClick={() => navigate("/Bookcrane")}
              >
                Book a Crane
              </button>
              <button 
                className="aba-btn aba-btn-secondary"
                onClick={() => navigate("/Contact")}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
