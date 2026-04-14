import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyBookingsAPI, getMyPaymentsAPI, userCancelBookingAPI } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null, reason: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUserData = useCallback(async () => {
    if (!token || !user) return;
    
    try {
      setStatsLoading(true);
      const [bookingsRes, paymentsRes] = await Promise.all([
        getMyBookingsAPI(token),
        getMyPaymentsAPI(token)
      ]);

      setBookings(bookingsRes.bookings || []);
      setPayments(paymentsRes.payments || []);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    } finally {
      setStatsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchUserData();
  }, [refreshKey, fetchUserData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (token && user) {
        setStatsLoading(true);
        fetchUserData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [token, user, fetchUserData]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedBookings = bookings.filter(b => b.status === "Completed").length;

  const handleCancelBooking = async () => {
    try {
      const res = await userCancelBookingAPI(cancelModal.bookingId, cancelModal.reason, token);
      if (res) {
        setBookings(bookings.map(b => b._id === cancelModal.bookingId ? { ...b, status: "Cancelled" } : b));
        setCancelModal({ show: false, bookingId: null, reason: "" });
        alert("Booking cancelled successfully!");
      }
    } catch (err) {
      alert("Error cancelling booking");
    }
  };

  return (
    <div className="userdash-dashboard-page">
      <div className="userdash-dashboard-container">
        {/* Sidebar */}
        <div className="userdash-dashboard-sidebar">
          <div className="userdash-user-profile">
            <div className="userdash-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="userdash-user-info">
              <h3>{user?.name || "User"}</h3>
              <p>{user?.role || "user"}</p>
            </div>
          </div>

          <nav className="userdash-sidebar-nav">
            <button 
              onClick={() => setActiveTab("bookings")} 
              className={`userdash-nav-item ${activeTab === "bookings" ? "userdash-active" : ""}`}
            >
              📋 My Bookings ({bookings.length})
            </button>
            <button 
              onClick={() => setActiveTab("payments")} 
              className={`userdash-nav-item ${activeTab === "payments" ? "userdash-active" : ""}`}
            >
              💳 Payments (₹{totalSpent})
            </button>
            <button 
              onClick={() => setActiveTab("profile")} 
              className={`userdash-nav-item ${activeTab === "profile" ? "userdash-active" : ""}`}
            >
              👤 Profile
            </button>
            <button 
              onClick={() => setActiveTab("tracking")} 
              className={`userdash-nav-item ${activeTab === "tracking" ? "userdash-active" : ""}`}
            >
              📍 Track Booking
            </button>
            <button 
              onClick={() => navigate("/feedback")} 
              className="userdash-nav-item"
            >
              💬 Feedback
            </button>
            <button 
              onClick={handleLogout} 
              className="userdash-nav-item userdash-logout"
            >
              🚪 Logout
            </button>
          </nav>
        </div>

        {/* Main */}
        <div className="userdash-dashboard-main">
          <div className="userdash-dashboard-header">
            <h1>Welcome back, {user?.name} 👋</h1>
            <button onClick={() => setRefreshKey(prev => prev + 1)}>
              {statsLoading ? "🔄 Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="userdash-stats-grid">
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--userdash-violet)' }}>
                {bookings.length}
              </div>
              <div>Total Bookings</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--userdash-skyblue)' }}>
                ₹{totalSpent}
              </div>
              <div>Total Spent</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--userdash-purple)' }}>
                {completedBookings}
              </div>
              <div>Completed</div>
            </div>
          </div>

          {/* Profile Tab - Show all user details */}
          {activeTab === "profile" && (
            <div>
              <h2 className="userdash-section-title">My Profile</h2>
              <div className="userdash-profile-grid">
                <div className="userdash-profile-card">
                  <h3>Personal Information</h3>
                  <div className="userdash-profile-field">
                    <strong>Name:</strong> {user?.name || 'N/A'}
                  </div>
                  <div className="userdash-profile-field">
                    <strong>Email:</strong> {user?.email || 'N/A'}
                  </div>
                  <div className="userdash-profile-field">
                    <strong>Role:</strong> <span className={`userdash-role-${user?.role || 'user'}`}>
                      {user?.role || 'user'}
                    </span>
                  </div>
                </div>
                <div className="userdash-profile-actions">
                  <button className="userdash-btn-primary" onClick={() => navigate('/edit-profile')}>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div>
              <h2 className="userdash-section-title">Payments History</h2>
              {payments.length === 0 ? (
                <p className="userdash-empty-text">No payments yet. Make a booking to see payment history.</p>
              ) : (
                <table className="userdash-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td>{p.booking?.trackingId || p._id?.slice(-6)}</td>
                        <td>₹{p.amount}</td>
                        <td><span className={`userdash-status-${p.status?.toLowerCase()}`}>
                          {p.status}
                        </span></td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div>
              <h2 className="userdash-section-title">My Bookings ({bookings.length})</h2>
              {bookings.length === 0 ? (
                <p className="userdash-empty-text">No bookings yet. Book a crane to get started!</p>
              ) : (
                <table className="userdash-table">
                  <thead>
                    <tr>
                      <th>Tracking ID</th>
                      <th>Crane Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice().reverse().map(b => (
                      <tr key={b._id}>
                        <td>{b.trackingId}</td>
                        <td>{b.craneType}</td>
                        <td><span className={`userdash-status-${b.status?.toLowerCase()}`}>
                          {b.status}
                        </span></td>
                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td>
                          {b.status === 'Confirmed' && (
                            <button 
                              onClick={() => setCancelModal({ show: true, bookingId: b._id, reason: '' })}
                              className="userdash-btn-danger"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === "tracking" && (
            <div>
              <h2 className="userdash-section-title">Track Booking</h2>
              <p className="userdash-empty-text">Enter tracking ID to track live location (coming soon)</p>
            </div>
          )}

        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="userdash-modal-overlay">
          <div className="userdash-modal">
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel this booking?</p>
            <textarea
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              placeholder="Reason for cancellation (optional)..."
              rows={4}
              className="userdash-input"
            />
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setCancelModal({ show: false, bookingId: null, reason: "" })}
                className="userdash-modal-secondary"
              >
                No, Keep Booking
              </button>
              <button 
                onClick={handleCancelBooking} 
                className="userdash-modal-primary"
                disabled={!cancelModal.reason.trim()}
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

