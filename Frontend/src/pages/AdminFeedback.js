import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllFeedbackAPI, updateFeedbackStatusAPI, deleteFeedbackAPI } from "../services/api";
import { FaStar, FaTrash, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import AdminSidebar from "../Components/AdminSidebar";
import "../Components/AdminSidebar.css";
import "./AdminFeedback.css";

function AdminFeedback() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, feedbackId: null });

  useEffect(() => {
    console.log("AdminFeedback useEffect - user:", user, "role:", user?.role, "token:", token ? "present" : "missing");
    if (token && user?.role === "admin") {
      fetchFeedbacks();
    } else {
      console.log("Not fetching - user role:", user?.role);
    }
  }, [token, user]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      console.log("Making API call to fetch feedbacks...");
      const res = await getAllFeedbackAPI(token);
      console.log("Feedbacks response:", res);
      if (res.feedback) {
        setFeedbacks(res.feedback);
      } else {
        console.log("No feedback data in response");
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
      alert("Error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (feedbackId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await updateFeedbackStatusAPI(feedbackId, newStatus, token);
      if (res) {
        setFeedbacks(feedbacks.map(f => 
          f._id === feedbackId ? { ...f, isApproved: newStatus } : f
        ));
        alert(newStatus ? "Feedback is now visible to public!" : "Feedback is now hidden from public!");
      }
    } catch (err) {
      alert("Error updating feedback status: " + (err.message || "Unknown error"));
    }
  };

  const handleDeleteFeedback = async () => {
    try {
      const res = await deleteFeedbackAPI(deleteModal.feedbackId, token);
      if (res) {
        setFeedbacks(feedbacks.filter(f => f._id !== deleteModal.feedbackId));
        setDeleteModal({ show: false, feedbackId: null });
        alert("Feedback deleted successfully!");
      }
    } catch (err) {
      alert("Error deleting feedback: " + (err.message || "Unknown error"));
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>🔒 Access Denied</h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>You must be an admin to view this page.</p>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #facc15 0%, #fbbf24 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#0f172a',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // handleLogout moved to AdminSidebar

  const filteredFeedbacks = feedbacks.filter(f =>
    (f.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.comment || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        style={{ 
          color: i < rating ? '#facc15' : '#4b5563',
          marginRight: '2px'
        }} 
      />
    ));
  };

  return (
    <div className="dashboard-page">
      <div className="admin-container">
        <AdminSidebar 
          user={user} 
          logout={logout} 
          navigate={navigate} 
          currentPath="/admin/feedback" 
        />
        {/* Main Content */}
        <div className="dashboard-main">

          <div className="dashboard-header">
            <h1 className="headd"> 💬 Feedback Management</h1>
            <p>Manage customer feedback - approve, hide, or delete</p>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: '30px' }}>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-number">{feedbacks.length}</span>
                <span className="stat-label">Total Feedback</span>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: '#22c55e' }}>
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number" style={{ color: '#22c55e' }}>
                  {feedbacks.filter(f => f.isApproved).length}
                </span>
                <span className="stat-label">Approved</span>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: '#ef4444' }}>
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <span className="stat-number" style={{ color: '#ef4444' }}>
                  {feedbacks.filter(f => !f.isApproved).length}
                </span>
                <span className="stat-label">Hidden</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by name or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                minWidth: '300px'
              }}
            />
          </div>
          
          {filteredFeedbacks.length > 0 ? (
            <div className="feedback-list">
              {filteredFeedbacks.map(f => (
                <div 
                  key={f._id} 
                  className="feedback-card-admin"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    borderLeft: f.isApproved ? '4px solid #22c55e' : '4px solid #ef4444'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{f.name}</h3>
                        {f.company && (
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>({f.company})</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex' }}>
                          {renderStars(f.rating)}
                        </div>
                        <span style={{ color: '#facc15', fontWeight: '600' }}>{f.rating}/5</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleApproval(f._id, f.isApproved)}
                        style={{
                          padding: '8px 12px',
                          background: f.isApproved ? '#facc15' : '#22c55e',
                          border: 'none',
                          borderRadius: '6px',
                          color: f.isApproved ? '#0f172a' : '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title={f.isApproved ? "Hide from public" : "Show to public"}
                      >
                        {f.isApproved ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                        {f.isApproved ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, feedbackId: f._id })}
                        style={{
                          padding: '8px 12px',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Delete feedback"
                      >
                        <FaTrash size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ color: '#cbd5e1', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                    {f.comment}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                    <span>User: {f.userId?.name || "Unknown"} ({f.userId?.email || "N/A"})</span>
                    <span>Submitted: {new Date(f.createdAt).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <span 
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '600',
                        backgroundColor: f.isApproved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: f.isApproved ? '#22c55e' : '#ef4444'
                      }}
                    >
                      {f.isApproved ? "✓ Visible to Public" : "✕ Hidden from Public"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#94a3b8' 
            }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No feedback found</p>
              <p style={{ fontSize: '14px' }}>Customer feedback will appear here after they submit.</p>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModal.show && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: '#0f172a',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '400px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{ marginTop: 0, color: '#fff', marginBottom: '16px' }}>Delete Feedback?</h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                  Are you sure you want to delete this feedback? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setDeleteModal({ show: false, feedbackId: null })}
                    style={{
                      padding: '10px 20px',
                      background: '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteFeedback}
                    style={{
                      padding: '10px 20px',
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
              Loading feedbacks...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;

