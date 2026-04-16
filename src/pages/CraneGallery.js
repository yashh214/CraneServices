import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./CraneGallery.css";
import { getAllCranesAPI, getStatsAPI } from "../services/api";

// Placeholder image for cranes without images
const placeholderCrane = "https://via.placeholder.com/400x300?text=No+Image+Available";

function CraneGallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({ projectsCompleted: 0, craneFleet: 0 });
  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatsAPI();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchCranes = async () => {
      try {
        setLoading(true);
        const data = await getAllCranesAPI();
        if (data && data.cranes && data.cranes.length > 0) {
          const dbCranes = data.cranes
            .filter(crane => crane.availability !== false)
            .map((crane, index) => ({
              id: crane._id || index,
              img: crane.image ? `http://localhost:8000${crane.image}` : placeholderCrane,
              name: crane.name,
              capacity: crane.capacity,
              description: crane.description || "Professional crane service",
              type: crane.type,
              hourlyRate: crane.hourlyRate,
              location: crane.location,
              isFromDB: true
            }));
          
          setCranes(dbCranes);
        } else {
          setCranes([]);
        }
      } catch (error) {
        console.error("Error fetching cranes:", error);
        setCranes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchCranes();
  }, []);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(cranes[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const prevImage = () => {
    const newIndex = currentIndex === 0 ? cranes.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(cranes[newIndex]);
  };

  const nextImage = () => {
    const newIndex = currentIndex === cranes.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedImage(cranes[newIndex]);
  };

  return (
    <div className="cg-gallery-page">
      <div className="cg-gallery-header">
        <h1>Our Crane Fleet</h1>
        <p>Explore our diverse range of professional cranes for all your construction needs</p>
      </div>

      <div className="cg-gallery-stats">
        <div className="cg-stat-item">
          <span className="cg-stat-number">{cranes.length}</span>
          <span className="cg-stat-label">Cranes Available</span>
        </div>
        <div className="cg-stat-item">
          <span className="cg-stat-number">24/7</span>
          <span className="cg-stat-label">Availability</span>
        </div>
        <div className="cg-stat-item">
          <span className="cg-stat-number">{stats.projectsCompleted || 0}+</span>
          <span className="cg-stat-label">Projects Completed</span>
        </div>
      </div>

      <div className="cg-gallery-grid">
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading cranes...
          </div>
        ) : cranes.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No cranes available</p>
            <p style={{ fontSize: '14px' }}>Please contact us to know about our crane services</p>
          </div>
        ) : (
          cranes.map((crane, index) => (
            <div 
              className="cg-gallery-card" 
              key={crane.id}
              onClick={() => openLightbox(index)}
            >
              <div className="cg-card-image">
                <img src={crane.img} alt={crane.name} />
                <div className="cg-card-overlay">
                  <FaSearch className="cg-search-icon" />
                </div>
              </div>
              <div className="cg-card-content">
                <h3>{crane.name}</h3>
                <span className="cg-capacity">{crane.capacity} tons</span>
                <p className="cg-description">{crane.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="cg-lightbox" onClick={closeLightbox}>
          <button className="cg-close-btn" onClick={closeLightbox}>
            <FaTimes />
          </button>
          <button className="cg-nav-btn cg-nav-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <FaChevronLeft />
          </button>
          
          <div className="cg-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.img} alt={selectedImage.name} />
            <div className="cg-lightbox-info">
              <h2>{selectedImage.name}</h2>
              <span className="cg-lightbox-capacity">{selectedImage.capacity}</span>
              <p className="cg-lightbox-description">{selectedImage.description}</p>
            </div>
          </div>
          
          <button className="cg-nav-btn cg-nav-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

export default CraneGallery;

