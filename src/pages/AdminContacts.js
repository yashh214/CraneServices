import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllContactsAPI, updateContactStatusAPI, deleteContactAPI } from "../services/api";
import { FaTrash, FaPhone, FaEnvelope, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import AdminSidebar from "../Components/AdminSidebar";
import "../Components/AdminSidebar.css";
import "./AdminContacts.css";

function AdminContacts() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ show: false, contactId: null });
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchContacts();
    }
  }, [token, user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await getAllContactsAPI(token);
      if (res.data) {
        setContacts(res.data);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
      alert("Error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      const res = await updateContactStatusAPI(contactId, newStatus, token);
      if (res) {
        setContacts(contacts.map(c => 
          c._id === contactId ? { ...c, status: newStatus } : c
        ));
        alert(`Contact status updated to ${newStatus}!`);
      }
    } catch (err) {
      alert("Error updating contact status: " + (err.message || "Unknown error"));
    }
  };

  const handleDeleteContact = async () => {
    try {
      const res = await deleteContactAPI(deleteModal.contactId, token);
      if (res) {
        setContacts(contacts.filter(c => c._id !== deleteModal.contactId));
        setDeleteModal({ show: false, contactId: null });
        alert("Contact deleted successfully!");
      }
    } catch (err) {
      alert("Error deleting contact: " + (err.message || "Unknown error"));
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

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      (c.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").includes(searchTerm) ||
      (c.message || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#facc15';
      case 'contacted': return '#3b82f6';
      case 'resolved': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'crane_booking': return 'Crane Booking';
      case 'emergency_service': return 'Emergency Service';
      case 'general_inquiry': return 'General Inquiry';
      default: return type;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="admin-container">
        <AdminSidebar 
          user={user} 
          logout={logout} 
          navigate={navigate} 
          currentPath="/admin/contacts" 
        />
        {/* Main Content */}
        <div className="dashboard-main">

          <div className="dashboard-header">
            <h1 className="headd">📬 Contact Inquiries</h1>
            <p>Manage customer contact inquiries and responses</p>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: '30px' }}>
            <div className="stat-card">
              <div className="stat-icon">📬</div>
              <div className="stat-info">
                <span className="stat-number">{contacts.length}</span>
                <span className="stat-label">Total Inquiries</span>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: '#facc15' }}>
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-number" style={{ color: '#facc15' }}>
                  {contacts.filter(c => c.status === 'pending').length}
                </span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: '#3b82f6' }}>
              <div className="stat-icon">📞</div>
              <div className="stat-info">
                <span className="stat-number" style={{ color: '#3b82f6' }}>
                  {contacts.filter(c => c.status === 'contacted').length}
                </span>
                <span className="stat-label">Contacted</span>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: '#22c55e' }}>
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number" style={{ color: '#22c55e' }}>
                  {contacts.filter(c => c.status === 'resolved').length}
                </span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name, email, phone or message..."
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          {filteredContacts.length > 0 ? (
            <div className="contacts-list">
              {filteredContacts.map(c => (
                <div 
                  key={c._id} 
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    borderLeft: `4px solid ${getStatusColor(c.status)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
                          {c.firstName} {c.lastName}
                        </h3>
                        <span 
                          style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '11px', 
                            fontWeight: '600',
                            backgroundColor: `${getStatusColor(c.status)}20`,
                            color: getStatusColor(c.status)
                          }}
                        >
                          {c.status?.toUpperCase()}
                        </span>
                        <span 
                          style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '11px', 
                            fontWeight: '600',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8'
                          }}
                        >
                          {getServiceTypeLabel(c.serviceType)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                          <FaEnvelope size={14} />
                          <span style={{ fontSize: '14px' }}>{c.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                          <FaPhone size={14} />
                          <span style={{ fontSize: '14px' }}>{c.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                          <FaClock size={14} />
                          <span style={{ fontSize: '14px' }}>
                            {new Date(c.createdAt).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {c.status !== 'contacted' && (
                        <button
                          onClick={() => handleUpdateStatus(c._id, 'contacted')}
                          style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
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
                          title="Mark as Contacted"
                        >
                          <FaPhone size={12} />
                          Mark Contacted
                        </button>
                      )}
                      {c.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(c._id, 'resolved')}
                          style={{
                            padding: '8px 16px',
                            background: '#22c55e',
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
                          title="Mark as Resolved"
                        >
                          <FaCheck size={12} />
                          Resolve
                        </button>
                      )}
                      {c.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(c._id, 'pending')}
                          style={{
                            padding: '8px 16px',
                            background: '#64748b',
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
                          title="Mark as Pending"
                        >
                          <FaTimes size={12} />
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({ show: true, contactId: c._id })}
                        style={{
                          padding: '8px 16px',
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
                        title="Delete contact"
                      >
                        <FaTrash size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    borderRadius: '8px', 
                    padding: '16px',
                    marginTop: '12px'
                  }}>
                    <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.6', fontSize: '14px' }}>
                      <strong style={{ color: '#94a3b8' }}>Message:</strong><br/>
                      {c.message}
                    </p>
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
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No contact inquiries found</p>
              <p style={{ fontSize: '14px' }}>Customer inquiries will appear here after they submit the contact form.</p>
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
                <h3 style={{ marginTop: 0, color: '#fff', marginBottom: '16px' }}>Delete Contact Inquiry?</h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                  Are you sure you want to delete this contact inquiry? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setDeleteModal({ show: false, contactId: null })}
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
                    onClick={handleDeleteContact}
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
              Loading contacts...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminContacts;

