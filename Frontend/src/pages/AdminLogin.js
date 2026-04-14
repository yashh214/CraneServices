import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAPI } from "../services/api";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaUserTie } from "react-icons/fa";
import logo from  "../../src/Images/Ganeshlogo.jpeg"
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage("");

    try {
      const data = await loginAPI(email, password);
      
      if (data.user.role !== 'admin') {
        setError(true);
        setErrorMessage("Access denied. Admin credentials required.");
        setLoading(false);
        return;
      }
      
      setSuccess(true);
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      };
      
      login(userData, data.token);
      
      localStorage.setItem("isAdmin", "true");

      if (rememberMe) {
        localStorage.setItem("loggedIn", "true");
      }

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1200);
    } catch (err) {
      setError(true);
      setErrorMessage(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className={`admin-login-card ${error ? "admin-login-shake" : ""}`}>
        
        <div className="admin-login-header">
          <div className="admin-login-icon-wrapper">
          </div>
          <img src={logo} alt="Ganesh Crane Services" className="admin-login-logo-img" />
          <h2 className="admin-login-title">Admin Portal</h2>
          <p className="admin-login-subtitle">Sign in to access admin dashboard</p>
        </div>

        {success && (
          <div className="admin-login-success">
            ✓ Login Successful! Redirecting...
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
          <div className="admin-login-input-box admin-login-floating">
            <FaUser className="admin-login-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
            />
            <label>Admin Email</label>
          </div>

          <div className="admin-login-input-box admin-login-floating">
            <FaLock className="admin-login-icon" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
            />
            <label>Password</label>

            <span
              className="admin-login-eye"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="admin-login-options">
            <label className="admin-login-remember">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button className="admin-login-btn" disabled={loading}>
            {loading ? <div className="admin-login-spinner"></div> : "Admin Sign In"}
          </button>
        </form>

        <Link to="/Login" className="admin-login-back">
          ← Back to User Login
        </Link>

      </div>
    </div>
  );
};

export default AdminLogin;

