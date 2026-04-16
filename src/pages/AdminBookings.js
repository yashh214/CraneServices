import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllBookingsAPI, completeBookingAPI, cancelBookingAPI } from "../services/api";
import "./AdminBookings.css";
import AdminSidebar from "../Components/AdminSidebar";
import "../Components/AdminSidebar.css";

function AdminBookings() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null, reason: "" });

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchBookings();
    }
  }, [token, user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookingsAPI(token);
      setBookings(res.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const res = await completeBookingAPI(bookingId, token);
      if (res) {
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: "Completed" } : b));
        alert("Booking marked as completed!");
      }
    } catch (err) {
      alert("Error completing booking: " + (err.message || "Unknown error"));
    }
  };

  const handleCancelBooking = async () => {
    try {
      const res = await cancelBookingAPI(cancelModal.bookingId, cancelModal.reason, token);
      if (res) {
        setBookings(bookings.map(b => b._id === cancelModal.bookingId ? { ...b, status: "Cancelled" } : b));
        setCancelModal({ show: false, bookingId: null, reason: "" });
        alert("Booking cancelled successfully!");
      }
    } catch (err) {
      alert("Error cancelling booking: " + (err.message || "Unknown error"));
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="abk-dashboard-page">
        <div className="abk-dashboard-container">
          <div className="abk-access-denied">
            <h2 className="abk-access-denied-title">🔒 Access Denied</h2>
            <p className="abk-access-denied-text">You must be an admin to view this page.</p>
            <button 
              onClick={() => navigate('/')}
              className="abk-btn-home"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // handleLogout moved to AdminSidebar

  const filteredBookings = bookings.filter(b =>
    (b.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.trackingId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.craneType || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="abk-dashboard-page">
      <div className="admin-container">
        <AdminSidebar 
          user={user} 
          logout={logout} 
          navigate={navigate} 
          currentPath="/admin/bookings" 
        />
        {/* Main Content */}
        <div className="abk-dashboard-main">

          <div className="abk-dashboard-header">
            <h1>📋 All Bookings</h1>
            <p>Manage and track all customer bookings</p>
          </div>

          <div className="abk-search-section">
            <input
              type="text"
              placeholder="Search by customer name, booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="abk-search-input"
            />
          </div>
          
          {filteredBookings.length > 0 ? (
            <div className="abk-admin-table-container">
              <div className="abk-admin-table-wrapper">
                <table className="abk-admin-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Crane Type</th>
                      <th>📍 Pickup</th>
                      <th>🏁 Destination</th>
                      <th>Date</th>
                      <th>Hours</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b._id}>
                    <td className="abk-tracking-id">{b.trackingId}</td>
                    <td>{b.user?.name || "Unknown"}</td>
                    <td>{b.craneType}</td>
                    <td className="abk-address-cell" title={b.pickupAddress || b.location || "N/A"}>
                      {b.pickupAddress || b.location || "N/A"}
                    </td>
                    <td className="abk-address-cell" title={b.destination || "N/A"}>
                      {b.destination || "N/A"}
                    </td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>{b.hours}</td>
                    <td>
                      <span className={`abk-status-badge abk-status-${b.status.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="abk-amount">₹{parseFloat(b.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td>
                      <div className="abk-actions">
                        {b.status !== "Completed" && b.status !== "Cancelled" && (
                          <>
                            <button
                              onClick={() => handleCompleteBooking(b._id)}
                              className="abk-btn abk-btn-complete"
                            >
                              ✓ Complete
                            </button>
                            <button
                              onClick={() => setCancelModal({ show: true, bookingId: b._id, reason: "" })}
                              className="abk-btn abk-btn-cancel"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          ) : (
            <p className="abk-no-bookings">No bookings found</p>
          )}

          {/* Booking Cancellation Modal */}
{cancelModal.show && (
            <div className="abk-modal-overlay">
              <div className="abk-modal-content">
                <h3 className="abk-modal-title">Cancel Booking</h3>
                <p className="abk-modal-desc">Please provide a reason for cancellation:</p>
                <textarea
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                  placeholder="Enter cancellation reason..."
                  className="abk-modal-textarea"
                />
                <div className="abk-modal-buttons">
                  <button
                    onClick={() => setCancelModal({ show: false, bookingId: '', reason: '' })}
                    className="abk-btn abk-btn-close"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleCancelBooking()}
                    className="abk-btn abk-btn-confirm-cancel"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="abk-loading">
              Loading bookings...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBookings;
