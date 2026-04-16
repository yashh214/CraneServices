import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getPaymentTotalsAPI, getAllBookingsAPI } from "../services/api";
import AdminSidebar from "../Components/AdminSidebar";
import "../Components/AdminSidebar.css";
import "./AdminCustomers.css";

function AdminCustomers() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [totals, setTotals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchData();
    }
  }, [token, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [totalsRes, bookingsRes] = await Promise.all([
        getPaymentTotalsAPI(token),
        getAllBookingsAPI(token)
      ]);
      setTotals(totalsRes.totals || []);
      setBookings(bookingsRes.bookings || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
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

  const filteredTotals = totals.filter(t =>
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalCustomers = totals.length;
  const totalRevenue = totals.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalBookings = bookings.length;

  return (
    <div className="dashboard-page">
      <div className="admin-container">
        <AdminSidebar 
          user={user} 
          logout={logout} 
          navigate={navigate} 
          currentPath="/admin/customers" 
        />
        {/* Main Content */}
        <div className="dashboard-main">

          <div className="dashboard-header">
            <h1 className="headd">👥 Customer Summary</h1>
            <p>View customer spending patterns and booking history</p>
          </div>

          {/* Customer Stats */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">{totalCustomers}</span>
                <span className="stat-label">Total Customers</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-number">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="stat-label">Total Revenue</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <span className="stat-number">{totalBookings}</span>
                <span className="stat-label">Total Bookings</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <span className="stat-number">₹{totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers).toLocaleString('en-IN') : 0}</span>
                <span className="stat-label">Avg per Customer</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by name, email..."
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
          
          {filteredTotals.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Total Spent</th>
                  <th>Booking Count</th>
                  <th>Avg per Booking</th>
                </tr>
              </thead>
              <tbody>
                {filteredTotals
                  .sort((a, b) => (b.total || 0) - (a.total || 0))
                  .map(t => {
                    const customerBookingCount = bookings.filter(b => b.user?._id === t.userId).length;
                    const avgPerBooking = customerBookingCount > 0 ? (t.total || 0) / customerBookingCount : 0;
                    return (
                      <tr key={t.userId}>
                        <td style={{ fontWeight: '600' }}>{t.name}</td>
                        <td style={{ fontSize: '13px', color: '#94a3b8' }}>{t.email}</td>
                        <td style={{ fontWeight: '600', color: '#22c55e' }}>₹{(t.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td>{customerBookingCount}</td>
                        <td>₹{avgPerBooking.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#94a3b8', marginTop: '20px' }}>No customer data available</p>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
              Loading customer data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCustomers;
