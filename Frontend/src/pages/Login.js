import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAPI } from "../services/api";
import { validateField } from "../utils/validation";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from  "../../src/Images/Ganeshlogo.jpeg"
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const loginAsAdmin = searchParams.get('role') === 'admin';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let validationResult;

    switch (name) {
      case "email":
        validationResult = validateField(value, "Email", { required: true, email: true });
        break;
      case "password":
        validationResult = validateField(value, "Password", { required: true });
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

    const emailResult = validateField(email, "Email", { required: true, email: true });
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error;
      isValid = false;
    }

    const passwordResult = validateField(password, "Password", { required: true });
    if (!passwordResult.isValid) {
      newErrors.password = passwordResult.error;
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

    if (!validateForm()) {
      setError(true);
      setErrorMessage("Please fix the validation errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      const data = await loginAPI(email, password);
      
      setSuccess(true);
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      };
      
      login(userData, data.token);

      if (rememberMe) {
        localStorage.setItem("loggedIn", "true");
      }

      setTimeout(() => {
        navigate("/Dashboard");
      }, 1200);
    } catch (err) {
      setError(true);
      setErrorMessage(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-user-wrapper">
      <div className={`login-user-card ${error ? "login-user-shake" : ""}`}>
        
        <div className="login-user-header">
          <img src={logo} alt="Ganesh Crane Services" className="login-user-logo-img" />
          <h2 className="login-user-title">Welcome Back</h2>
          <p className="login-user-subtitle">Sign in to your account</p>
        </div>

        {success && (
          <div className="login-user-success">
            ✓ Login Successful!
          </div>
        )}

        {error && (
          <div style={{ 
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
          <div className="login-user-input-box login-user-floating">
            <FaUser className="login-user-icon" />
            <input
              type="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              name="email"
              required
              placeholder=" "
            />
            <label>Email address</label>
            {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', display: 'block' }}>{errors.email}</span>}
          </div>

          <div className="login-user-input-box login-user-floating">
            <FaLock className="login-user-icon" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              name="password"
              required
              placeholder=" "
            />
            <label>Password</label>
            <span
              className="login-user-eye"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <span style={{ color: '#ef4444', fontSize: '12px', display: 'block' }}>{errors.password}</span>}
          </div>

          <div className="login-user-options">
            <label className="login-user-remember">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="login-user-forgot">
              Forgot Password?
            </a>
          </div>

          <button className="login-user-btn" disabled={loading}>
            {loading ? <div className="login-user-spinner"></div> : "Sign In"}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px' 
        }}>
          <p>Don't have an account? <Link to="/Signup" style={{ color: "var(--login-skyblue)" }}>
  Sign Up
</Link></p>
        </div>

      </div>
    </div>
  );
};

export default Login;