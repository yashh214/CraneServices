import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllPaymentsAPI } from "../services/api";
import AdminSidebar from "../Components/AdminSidebar";
import "../Components/AdminSidebar.css";
import "./AdminPayments.css";

function AdminPayments() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchPayments();
    }
  }, [token, user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPaymentsAPI(token);
      setPayments(res.payments || []);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
  return (
      <div className="vps-admin-payments-access-denied">
        <div className="vps-admin-access-denied-content">
          <h2 className="vps-admin-access-denied-title">🔒 Access Denied</h2>
          <p className="vps-admin-access-denied-text">You must be an admin to view this page.</p>
          <button 
            className="vps-admin-access-denied-btn"
            onClick={() => navigate('/')}
          >
            ← Go Home
          </button>
        </div>
      </div>
    );
  }

  // handleLogout moved to AdminSidebar

  const filteredPayments = payments.filter(p => 
    (p.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.booking?.trackingId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidCount = payments.filter(p => p.status === "Paid").length;
  const pendingCount = payments.filter(p => p.status === "Pending").length;

  return (
    <div className="vps-admin-payments-page">
      <div className="admin-container">
        <AdminSidebar 
          user={user} 
          logout={logout} 
          navigate={navigate} 
          currentPath="/admin/payments" 
        />
        {/* Main Content */}
        <div className="vps-admin-payments-main">

          <div className="vps-admin-payments-header">
            <h1>💳 Payment Records</h1>
            <p>Track and manage all payment transactions</p>
          </div>

          {/* Payment Stats */}
          <div className="vps-admin-payments-stats-grid">
            <div className="vps-admin-payments-stat-card vps-revenue-highlight">
              <div className="vps-admin-payments-stat-icon">💰</div>
              <div>
                <div className="vps-admin-payments-stat-number">
                  ₹{formatRevenue(totalAmount)}
                </div>
                <div className="vps-admin-payments-stat-label">Total Revenue</div>
              </div>
            </div>
            <div className="vps-admin-payments-stat-card">
              <div className="vps-admin-payments-stat-icon">✅</div>
              <div>
                <div className="vps-admin-payments-stat-number">{paidCount}</div>
                <div className="vps-admin-payments-stat-label">Paid Transactions</div>
              </div>
            </div>
            <div className="vps-admin-payments-stat-card">
              <div className="vps-admin-payments-stat-icon">⏳</div>
              <div>
                <div className="vps-admin-payments-stat-number">{pendingCount}</div>
                <div className="vps-admin-payments-stat-label">Pending</div>
              </div>
            </div>
            <div className="vps-admin-payments-stat-card">
              <div className="vps-admin-payments-stat-icon">📊</div>
              <div>
                <div className="vps-admin-payments-stat-number">{payments.length}</div>
                <div className="vps-admin-payments-stat-label">Total Payments</div>
              </div>
            </div>
          </div>

          <div className="vps-admin-payments-controls">
            <input
              className="vps-admin-payments-search"
              type="text"
              placeholder="🔍 Search by customer, booking ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className="vps-btn vps-btn-primary" 
              onClick={fetchPayments}
              disabled={loading}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
          
          {filteredPayments.length > 0 ? (
            <div className="vps-admin-payments-table-container">
              <table className="vps-admin-payments-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p._id}>
                      <td className="vps-admin-payments-booking-id">{p.booking?.trackingId || "-"}</td>
                      <td>{p.user?.name || "Unknown"}</td>
                      <td className="vps-admin-payments-email">{p.user?.email || "-"}</td>
                      <td className="vps-admin-payments-amount">₹{p.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td>{p.method || "Online"}</td>
                      <td>
                        <span className={`vps-admin-payments-status-badge vps-admin-payments-status-${p.status?.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{new Date(p.paidAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="vps-admin-payments-empty">
              No payments found matching your search
            </div>
          )}

          {loading && (
            <div className="vps-admin-payments-loading">
              {loading ? '🔄 Loading payments...' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const formatRevenue = (amount) => {
  if (amount >= 10000000) {
    return (amount / 10000000).toFixed(1) + 'Cr';
  } else if (amount >= 100000) {
    return (amount / 100000).toFixed(1) + 'L';
  } else {
    return amount.toLocaleString('en-IN');
  }
};

export default AdminPayments;
