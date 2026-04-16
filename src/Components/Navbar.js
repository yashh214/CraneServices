import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHome, FaInfoCircle, FaPhone, FaUser, FaSignOutAlt, FaCogs, FaBars, FaTimes, FaChevronDown, FaUserTie, FaUserCircle } from "react-icons/fa";
import logo from "../Images/Ganeshlogo.jpeg";

import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/about", label: "About", icon: <FaInfoCircle /> },
    { path: "/contact", label: "Contact", icon: <FaPhone /> },
    { path: "/CraneGallery", label: "Gallery", icon: <FaCogs /> },
  ];

  return (
    <nav className="nav-root">
      <div className="nav-container">
        
        {/* Logo */}
        <div className="nav-logo">
          <Link to="/">
            <img src={logo} alt="Ganesh Crane Service" />
          </Link>
          <span className="nav-logo-text">Ganesh Crane Services</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="nav-link">
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth Buttons */}
        <div className="nav-auth">
          {isLoggedIn ? (
            <div className="nav-auth-buttons">
              {user?.role === 'admin' ? (
                <Link to="/admin/dashboard" className="nav-dashboard-btn">
                  <FaUserTie />
                  <span>Admin Dashboard</span>
                </Link>
              ) : (
                <Link to="/Dashboard" className="nav-dashboard-btn">
                  <FaUser />
                  <span>Dashboard</span>
                </Link>
              )}
              <button onClick={handleLogout} className="nav-logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-dropdown-container">
              <button 
                className="nav-login-btn nav-dropdown-toggle"
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              >
                <FaUser />
                <span>Login</span>
                <FaChevronDown className={`nav-dropdown-arrow ${loginDropdownOpen ? 'open' : ''}`} />
              </button>
              
              {loginDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <Link 
                    to="/Login" 
                    className="nav-dropdown-item"
                    onClick={() => setLoginDropdownOpen(false)}
                  >
                    <FaUserCircle />
                    <div className="nav-dropdown-item-text">
                      <span className="nav-dropdown-item-title">User Login</span>
                      <span className="nav-dropdown-item-desc">For customers</span>
                    </div>
                  </Link>
                  <Link 
                    to="/admin/login" 
                    className="nav-dropdown-item"
                    onClick={() => setLoginDropdownOpen(false)}
                  >
                    <FaUserTie />
                    <div className="nav-dropdown-item-text">
                      <span className="nav-dropdown-item-title">Admin Login</span>
                      <span className="nav-dropdown-item-desc">For administrators</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <Link to="/Bookcrane" className="nav-book-now-btn">
            <span>Book Now</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <ul className="nav-mobile-nav-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link 
                to={link.path} 
                className="nav-mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="nav-mobile-auth">
          {isLoggedIn ? (
            <>
              {user?.role === 'admin' ? (
                <Link 
                  to="/admin/dashboard" 
                  className="nav-mobile-dashboard-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link 
                  to="/Dashboard" 
                  className="nav-mobile-dashboard-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="nav-mobile-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <div className="nav-mobile-login-options">
              <Link 
                to="/Login" 
                className="nav-mobile-login-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaUserCircle /> User Login
              </Link>
              <Link 
                to="/admin/login" 
                className="nav-mobile-login-btn admin"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaUserTie /> Admin Login
              </Link>
            </div>
          )}
          <Link 
            to="/Bookcrane" 
            className="nav-mobile-book-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
