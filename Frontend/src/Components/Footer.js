import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../Images/Ganeshlogo.jpeg";

function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="vps-footer-main">
      {/* <div className="vps-footer-wave">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="vps-wave-shape"></path>
        </svg>
      </div> */}
      
      <div className="vps-footer-content">
        <div className="vps-footer-grid">
          
          {/* Company Info */}
          <div className="vps-footer-section vps-footer-about">
            <div className="vps-footer-logo-wrap">
              <img src={logo} alt="Ganesh Crane Services Logo" className="vps-footer-logo-img" />
              <span className="vps-logo-text">Ganesh Crane Services</span>
            </div>
            <p className="vps-company-desc">
              Professional crane rental & heavy lifting solutions. 
              24/7 emergency service available across Maharashtra.
            </p>
            <div className="vps-social-container">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="vps-social-link">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="vps-social-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="vps-social-link">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="vps-social-link">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66,0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="vps-footer-section">
            <h3>Quick Links</h3>
            <ul className="vps-footer-nav">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/About">About Us</Link></li>
              <li><Link to="/CraneGallery">Gallery</Link></li>
              <li><Link to="/Contact">Contact</Link></li>
              <li><Link to="/Login">Login</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="vps-footer-section">
            <h3>Our Services</h3>
            <ul className="vps-footer-nav">
              <li><Link to="/Bookcrane">Book Crane</Link></li>
              <li>Heavy Lifting</li>
              <li>Construction Support</li>
              <li>Transport Service</li>
              <li>Industrial Rigging</li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="vps-footer-section">
            <h3>Contact Us</h3>
            <div className="vps-contact-details">
              <p><span className="vps-contact-emoji">📍</span> Ganesh Crane Service<br />National Highway No.3, Chalisgaon Road, Chaugaon, Dhule, Maharashtra - 424311</p>
              <p>
                <span className="vps-contact-emoji">📞</span> 
                <a href="tel:+919876543210">+91 98765 43210</a>
              </p>
              <p>
                <span className="vps-contact-emoji">✉️</span> 
                <a href="mailto:ganeshcrane@gmail.com">ganeshcrane@gmail.com</a>
              </p>
            </div>
            
            <div className="vps-newsletter-area">
              <h4>Subscribe to Newsletter</h4>
              <form className="vps-newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="vps-newsletter-field"
                />
                <button type="submit" className="vps-newsletter-submit">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="vps-footer-bottom">
          <div className="vps-footer-bottom-wrap">
            <p>© 2026 Ganesh Crane Services. All Rights Reserved.</p>
            <div className="vps-footer-bottom-nav">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
