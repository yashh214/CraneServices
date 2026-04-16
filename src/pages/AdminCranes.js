import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAllCranesAPI,
  createCraneAPI,
  updateCraneAPI,
  deleteCraneAPI,
  toggleCraneAvailabilityAPI
} from "../services/api";
import AdminSidebar from "../Components/AdminSidebar";
import "../Components/AdminSidebar.css";
import "./AdminCranes.css";

function AdminCranes() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const [craneForm, setCraneForm] = useState({
    show: false,
    isEdit: false,
    data: {
      name: "",
      type: "",
      capacity: "",
      hourlyRate: "",
      description: "",
      location: "",
      registrationNo: "",
      image: null
    }
  });

  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchCranes();
    }
  }, [token, user]);

  const fetchCranes = async () => {
    try {
      setLoading(true);
      const res = await getAllCranesAPI();
      setCranes(res.cranes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrane = async () => {
    try {
      setError("");
      const data = craneForm.data;

      if (!data.name || !data.type || !data.capacity || !data.hourlyRate) {
        setError("Please fill all required fields");
        return;
      }

      let res;

      if (craneForm.isEdit) {
        res = await updateCraneAPI(data._id, data, token);
        setCranes(cranes.map(c => (c._id === data._id ? res.crane : c)));
      } else {
        res = await createCraneAPI(data, token);
        setCranes([...cranes, res.crane]);
      }

      setCraneForm({
        show: false,
        isEdit: false,
        data: {
          name: "",
          type: "",
          capacity: "",
          hourlyRate: "",
          description: "",
          location: "",
          registrationNo: "",
          image: null
        }
      });
      setImagePreview('');

      alert(craneForm.isEdit ? "Updated!" : "Added!");

    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenCraneModal = (isEdit = false, craneData = {}) => {
    let preview = '';
    if (isEdit && craneData.image) {
      preview = `http://localhost:8000${craneData.image}`;
    }
    setImagePreview(preview);
    setCraneForm({
      show: true,
      isEdit,
      data: craneData
    });
  };

  const handleCloseModal = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setCraneForm({
      show: false,
      isEdit: false,
      data: {
        name: "",
        type: "",
        capacity: "",
        hourlyRate: "",
        description: "",
        location: "",
        registrationNo: "",
        image: null
      }
    });
  };

  const handleDeleteCrane = async (id) => {
    if (window.confirm("Delete this crane?")) {
      await deleteCraneAPI(id, token);
      setCranes(cranes.filter(c => c._id !== id));
    }
  };

  const handleToggleAvailability = async (id) => {
    const res = await toggleCraneAvailabilityAPI(id, token);
    setCranes(cranes.map(c => (c._id === id ? res.crane : c)));
  };

  const filtered = cranes.filter(c =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== "admin") return <h2>Access Denied</h2>;

  return (
    <div className="vps-admin-cranes-page">
      <div className="admin-container">

        <AdminSidebar
          user={user}
          logout={logout}
          navigate={navigate}
          currentPath="/admin/cranes"
        />

        <div className="vps-admin-cranes-main">
          <div className="vps-admin-cranes-header">
            <h1>🏗️ Crane Fleet Management</h1>
            <p>Manage your crane inventory and availability</p>
          </div>

          <div className="vps-admin-cranes-controls">
            <input
              className="vps-admin-search-input"
              placeholder="🔍 Search cranes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className="vps-btn vps-btn-primary vps-admin-add-btn"
              onClick={() => handleOpenCraneModal(false)}

            >
              + Add New Crane
            </button>
          </div>
         <div className="vps-admin-table-container">
            <table className="vps-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Rate/hr</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

            <tbody>
              {filtered.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.type}</td>
                  <td>{c.capacity}</td>
                  <td>₹{c.hourlyRate}</td>
                  <td>
                    {c.isAvailable ? (
                      <span className="vps-admin-status-available">Available</span>
                    ) : (
                      <span className="vps-admin-status-busy">Busy</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="vps-admin-btn vps-admin-btn-toggle"
                      onClick={() => handleToggleAvailability(c._id)}
                    >
                      {c.isAvailable ? '⏳ Make Busy' : '✅ Make Available'}
                    </button>
                    <button 
                      className="vps-admin-btn vps-admin-btn-edit"
                      onClick={() => handleOpenCraneModal(true, c)}
                    >

                      ✏️ Edit
                    </button>
                    <button 
                      className="vps-admin-btn vps-admin-btn-delete"
                      onClick={() => handleDeleteCrane(c._id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          {/* Glassmorphism Modal - Home Theme */}
          {craneForm.show && (
            <div className="vps-admin-modal-overlay">
              <div className="vps-admin-modal">
                <div className="vps-admin-modal-header">
                  <h3>{craneForm.isEdit ? 'Edit Crane' : 'Add New Crane'}</h3>
                  <button 
                    className="vps-admin-modal-close"
                    onClick={handleCloseModal}
                  >

                    ×
                  </button>
                </div>

                {error && (
                  <div className="vps-admin-error">
                    ⚠️ {error}
                  </div>
                )}

                <form className="vps-admin-modal-form">

                  <div className="vps-admin-modal-field">
                    <label>Name *</label>
                    <input
                      placeholder="Crane name"
                      value={craneForm.data.name || ""}
                      onChange={(e) =>
                        setCraneForm({
                          ...craneForm,
                          data: { ...craneForm.data, name: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="vps-admin-modal-field">
                    <label>Type *</label>
                    <select
                      value={craneForm.data.type || ""}
                      onChange={(e) =>
                        setCraneForm({
                          ...craneForm,
                          data: { ...craneForm.data, type: e.target.value }
                        })
                      }
                    >
                      <option value="">Select type</option>
                      <option value="Mobile">Mobile Crane</option>
                      <option value="Hydra">Hydra Crane</option>
                      <option value="Crawler">Crawler Crane</option>
                      <option value="Tower">Tower Crane</option>
                      <option value="Rough Terrain">Rough Terrain</option>
                    </select>
                  </div>

                  <div className="vps-admin-modal-field">
                    <label>Capacity *</label>
                    <input
                      placeholder="e.g., 20 tons"
                      value={craneForm.data.capacity || ""}
                      onChange={(e) =>
                        setCraneForm({
                          ...craneForm,
                          data: { ...craneForm.data, capacity: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="vps-admin-modal-field">
                    <label>Hourly Rate (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 2500"
                      value={craneForm.data.hourlyRate || ""}
                      onChange={(e) =>
                        setCraneForm({
                          ...craneForm,
                          data: { ...craneForm.data, hourlyRate: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="vps-admin-modal-field">
                    <label>Description</label>
                    <textarea
                      placeholder="Additional details about the crane"
                      rows="3"
                      value={craneForm.data.description || ""}
                      onChange={(e) =>
                        setCraneForm({
                          ...craneForm,
                          data: { ...craneForm.data, description: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="vps-admin-modal-field">
                    <label>Registration No</label>
                    <input
                      placeholder="Vehicle registration number"
                      value={craneForm.data.registrationNo || ""}
                      onChange={(e) =>
                        setCraneForm({
                          ...craneForm,
                          data: { ...craneForm.data, registrationNo: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="vps-admin-modal-field">
                    <label>🖼️ Crane Image (Optional)</label>
                    {imagePreview && (
                      <div className="crane-image-preview">
                        <img src={imagePreview} alt="Preview" className="preview-img" />
                        <button
                          type="button"
                          className="preview-remove-btn"
                          onClick={() => {
                            if (imagePreview.startsWith('blob:')) {
                              URL.revokeObjectURL(imagePreview);
                            }
                            setImagePreview('');
                            setCraneForm({
                              ...craneForm,
                              data: { ...craneForm.data, image: null }
                            });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg, image/jpg, image/png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size <= 2 * 1024 * 1024) {
                          if (imagePreview && imagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(imagePreview);
                          }
                          const url = URL.createObjectURL(file);
                          setImagePreview(url);
                          setCraneForm({
                            ...craneForm,
                            data: { ...craneForm.data, image: file }
                          });
                        } else {
                          alert("Image must be JPG/PNG under 2MB");
                        }
                      }}
                    />
                  </div>

                  <div className="vps-admin-modal-actions">

                    <button 
                      className="vps-btn vps-btn-cancel"
                      type="button"
                      onClick={handleCloseModal}
                    >

                      Cancel
                    </button>
                    <button 
                      className="vps-btn vps-btn-primary"
                      type="button"
                      onClick={handleSaveCrane}
                    >
                      {craneForm.isEdit ? 'Update Crane' : 'Add Crane'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

          {loading && <p>Loading...</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminCranes;