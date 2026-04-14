import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = ({ user, token, logout, currentPath }) => {
  const navigate = useNavigate();

  const navItems = [
    { path: "/admin/dashboard", icon: "📊", label: "Overview" },
    { path: "/admin/bookings", icon: "📋", label: "All Bookings" },
    { path: "/admin/payments", icon: "💳", label: "Payments" },
    { path: "/admin/customers", icon: "👥", label: "Customers" },
    { path: "/admin/cranes", icon: "🏗️", label: "Cranes" },
    { path: "/admin/feedback", icon: "💬", label: "Feedback" },
    { path: "/admin/contacts", icon: "📬", label: "Contacts" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => currentPath === path;

  return (
    <div className="admin-sidebar">
      <div className="admin-user-profile">
        <div className="admin-user-avatar">🛡️</div>
        <div className="admin-user-info">
          <h3>{user?.name || "Admin"}</h3>
          <p>{user?.email || "admin@example.com"}</p>
          <span className="admin-role">Admin Panel</span>
        </div>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`admin-nav-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button className="admin-nav-item logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;

