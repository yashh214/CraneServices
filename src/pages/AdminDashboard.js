
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  getAllPaymentsAPI, 
  getPaymentTotalsAPI,
  getAllBookingsAPI,
  getAllCranesAPI
} from "../services/api";
import "./AdminDashboard.css";
import AdminSidebar from "../Components/AdminSidebar";
import "../Components/AdminSidebar.css";

function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cranes, setCranes] = useState([]);
  const [totals, setTotals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  
  // Crane Stats
  const [totalCranes, setTotalCranes] = useState(0);
  const [availableCranes, setAvailableCranes] = useState(0);
  const [unavailableCranes, setUnavailableCranes] = useState(0);

  // Helper to format large revenue amounts
  const formatRevenue = (amount) => {
    if (amount >= 10000000) {
      return (amount / 10000000).toFixed(1) + 'Cr';
    } else if (amount >= 100000) {
      return (amount / 100000).toFixed(1) + 'L';
    } else {
      return amount.toLocaleString('en-IN');
    }
  };

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchAllData();
    }
  }, [token, user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, totalsRes, bookingsRes, cranesRes] = await Promise.all([
        getAllPaymentsAPI(token),
        getPaymentTotalsAPI(token),
        getAllBookingsAPI(token),
        getAllCranesAPI()
      ]);
      
      setPayments(paymentsRes.payments || []);
      setTotals(totalsRes.totals || []);
      setBookings(bookingsRes.bookings || []);
      
      // Calculate crane stats from database only (dynamic counting)
      const dbCranes = cranesRes.cranes || [];
      setCranes(dbCranes);
      
      // Total cranes = only database cranes
      const dbCranesCount = dbCranes.length;
      setTotalCranes(dbCranesCount);
      
      // Available = cranes with no busy hours (isAvailable === true)
      const dbAvailable = dbCranes.filter(c => c.isAvailable === true).length;
      setAvailableCranes(dbAvailable);
      
      // Unavailable = cranes with busy hours
      const dbUnavailable = dbCranes.filter(c => c.isAvailable === false).length;
      setUnavailableCranes(dbUnavailable);
      
      // Calculate other stats
      const revenue = (paymentsRes.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const uniqueCustomers = new Set((paymentsRes.payments || []).map(p => p.user?._id)).size;
      
      setTotalRevenue(revenue);
      setTotalCustomers(uniqueCustomers);
      setTotalBookingsCount((bookingsRes.bookings || []).length);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="vps-admin-dashboard-page">
        <div className="vps-admin-dashboard-container">
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
<h2 style={{ color: 'var(--gradient-hero)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' , marginBottom: '20px', fontSize: '28px' }}>
              🔒 Access Denied
            </h2>
            <p style={{ color: 'var(--vps-text-gray)', marginBottom: '32px', fontSize: '16px' }}>
              You must be an admin to view this page.
            </p>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '14px 28px',
                background: 'var(--gradient-primary)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(139,92,246,0.3)'
              }}
            >
              ← Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // handleLogout moved to AdminSidebar

  return (
    <div className="vps-admin-dashboard-page">
      <div className="admin-container">
        <AdminSidebar 
          user={user} 
          logout={logout} 
          navigate={navigate} 
          currentPath="/admin/dashboard" 
        />
        {/* Main Content */}
        <div className="vps-admin-dashboard-main">

          <div className="vps-admin-dashboard-header">
            <div>
              <h1>🎯 Admin Dashboard</h1>
              <p>Welcome back, {user.name}. Manage your crane service operations.</p>
            </div>
            <button 
              onClick={fetchAllData}
              className="vps-admin-refresh-btn"
              disabled={loading}
            >
              {loading ? "🔄 Loading..." : "🔄 Refresh Data"}
            </button>
          </div>

          {/* Overview Stats */}
          <div className="vps-admin-stats-grid">
            <div className="vps-admin-stat-card vps-revenue-highlight">
              <div className="vps-admin-stat-icon">💰</div>
              <div>
                <div className="vps-admin-stat-number">
                  ₹{formatRevenue(totalRevenue)}
                </div>
                <div className="vps-admin-stat-label">Total Revenue</div>
              </div>
            </div>
            <div className="vps-admin-stat-card">
              <div className="vps-admin-stat-icon">📋</div>
              <div>
                <div className="vps-admin-stat-number">{totalBookingsCount}</div>
                <div className="vps-admin-stat-label">Total Bookings</div>
              </div>
            </div>
            <div className="vps-admin-stat-card">
              <div className="vps-admin-stat-icon">👥</div>
              <div>
                <div className="vps-admin-stat-number">{totalCustomers}</div>
                <div className="vps-admin-stat-label">Active Customers</div>
              </div>
            </div>
            <div className="vps-admin-stat-card">
              <div className="vps-admin-stat-icon">🏗️</div>
              <div>
                <div className="vps-admin-stat-number">{totalCranes}</div>
                <div className="vps-admin-stat-label">Total Cranes</div>
              </div>
            </div>
          </div>

          {/* Crane Status */}
          <div className="vps-admin-section-title">Crane Fleet Status</div>
          <div className="vps-admin-stats-grid">
            <div className="vps-admin-stat-card">
              <div className="vps-admin-stat-icon">✅</div>
              <div>
                <div className="admin-dbsh-stat-number" style={{ color: '#22c55e' }}>{availableCranes}</div>
                <div className="admin-dbsh-stat-label">Available Cranes</div>
              </div>
            </div>
            <div className="vps-admin-stat-card">
              <div className="vps-admin-stat-icon">⏳</div>
              <div>
                <div className="vps-admin-stat-number" style={{ color: '#ef4444' }}>{unavailableCranes}</div>
                <div className="vps-admin-stat-label">Busy Cranes</div>
              </div>
            </div>
            <div className="vps-admin-stat-card">
              <div className="vps-admin-stat-icon">📊</div>
              <div>
                <div className="vps-admin-stat-number">{totalCranes}</div>
                <div className="vps-admin-stat-label">Total Fleet</div>
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--vps-text-gray)',
              fontSize: '18px'
            }}>
              Loading dashboard data...
            </div>
          )}

          {!loading && cranes.length > 0 && (
            <>
              <div className="vps-admin-section-title">Fleet Overview</div>
              <div className="vps-admin-table-container">
                <table className="vps-admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Rate/hr</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cranes.map((crane) => (
                      <tr key={crane._id}>
                        <td><strong>{crane.name}</strong></td>
                        <td>{crane.type}</td>
                        <td>{crane.capacity}</td>
                        <td>₹{crane.hourlyRate}</td>
                        <td>
                          {crane.isAvailable ? (
                            <span className="vps-admin-status-available">
                              Available
                            </span>
                          ) : (
                            <span className="vps-admin-status-busy">
                              Busy
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

