import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Bookcrane.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllCranesAPI } from "../services/api";
import { validateField, validateFutureDate } from "../utils/validation";

// Placeholder image for cranes without images
const placeholderCrane = "https://via.placeholder.com/400x300?text=No+Image+Available";

// Fix Leaflet marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'book-vps-custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const pickupIcon = createCustomIcon('#22c55e');
const destinationIcon = createCustomIcon('#ef4444');

// Map click handler component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Map center handler component
function MapCenterHandler({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Map bounds handler
function MapBoundsHandler({ pickupCoords, destinationCoords }) {
  const map = useMap();
  
  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      const bounds = L.latLngBounds([pickupCoords, destinationCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords) {
      map.setView(pickupCoords, 15);
    }
  }, [pickupCoords, destinationCoords, map]);
  
  return null;
}

function BookCrane() {
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useAuth();
  const mapContainerId = "book-vps-booking-map-container";
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pickupAddress: "",
    destination: "",
    craneType: "",
    craneId: "",
    location: "",  
    date: "",
    hours: "",
    description: "",
    userId: "",
    token: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [craneLoading, setCraneLoading] = useState(true);
  
  // Map state
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeSelection, setActiveSelection] = useState("pickup");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [mapKey, setMapKey] = useState(0); 

  const [craneTypes, setCraneTypes] = useState([]);

  // Fetch cranes from database only (no static data)
  useEffect(() => {
    const fetchCranes = async () => {
      try {
        setCraneLoading(true);
        const data = await getAllCranesAPI();
        if (data && data.cranes && data.cranes.length > 0) {
          // Convert database cranes to match format
        const dbCranes = data.cranes
            .map((crane) => ({
              id: crane._id,
              name: crane.name,
              img: crane.image ? `http://localhost:8000${crane.image}` : placeholderCrane,
              capacity: crane.capacity,
              price: crane.hourlyRate ? `₹${crane.hourlyRate.toLocaleString()}/hour` : "Price on request",
              isFromDB: true,
              isAvailable: crane.isAvailable !== false,
              busyHours: crane.busyHours || 0
            }));
          
          setCraneTypes(dbCranes);
        } else {
          // No cranes in database
          setCraneTypes([]);
        }
      } catch (error) {
        console.error("Error fetching cranes:", error);
        setCraneTypes([]);
      } finally {
        setCraneLoading(false);
      }
    };

    fetchCranes();
  }, []);

  // Pre-populate form with logged-in user data
  useEffect(() => {
    if (isLoggedIn && user) {
      setForm(prevForm => ({
        ...prevForm,
        name: user.name || "",
        email: user.email || "",
        userId: user.id,
        token: token
      }));
    }
  }, [isLoggedIn, user, token]);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPickupCoords([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          setForm(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            pickupAddress: `Location detected`
          }));
        },
        (error) => {
          console.log("Could not get location:", error.message);
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCraneSelect = (craneId) => {
    setForm({ ...form, craneType: craneId });
  };

  // Search for location using Nominatim API
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
        { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
    setSearching(false);
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle selecting a search result
  const handleSelectSearchResult = (result) => {
    const coords = [parseFloat(result.lat), parseFloat(result.lon)];
    
    if (activeSelection === "pickup") {
      setPickupCoords(coords);
      setForm(prev => ({
        ...prev,
        pickupAddress: result.display_name,
        location: `${result.lat}, ${result.lon}`
      }));
    } else {
      setDestinationCoords(coords);
      setForm(prev => ({
        ...prev,
        destination: result.display_name
      }));
    }
    
    setMapCenter(coords);
    setMapZoom(15);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Handle map click
  const handleMapClick = useCallback((latlng) => {
    const coords = [latlng.lat, latlng.lng];
    
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
      .then(res => res.json())
      .then(data => {
        const address = data.display_name || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        
        if (activeSelection === "pickup") {
          setPickupCoords(coords);
          setForm(prev => ({
            ...prev,
            pickupAddress: address,
            location: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
          }));
        } else {
          setDestinationCoords(coords);
          setForm(prev => ({
            ...prev,
            destination: address
          }));
        }
      })
      .catch(() => {
        const coordsStr = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        if (activeSelection === "pickup") {
          setPickupCoords(coords);
          setForm(prev => ({
            ...prev,
            pickupAddress: coordsStr,
            location: coordsStr
          }));
        } else {
          setDestinationCoords(coords);
          setForm(prev => ({
            ...prev,
            destination: coordsStr
          }));
        }
      });
  }, [activeSelection]);

  const getCurrentLocation = () => {
    setLocationError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = [latitude, longitude];
          setPickupCoords(coords);
          setMapCenter(coords);
          setMapZoom(15);
          setForm(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            pickupAddress: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          }));
          setMapKey(prev => prev + 1);
        },
        (error) => {
          let errorMessage = "Unable to get your location. Please search manually.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location permission denied. Please search manually.";
          }
          setLocationError(errorMessage);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser. Please search manually.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert("Please login to book a crane");
      navigate("/Login");
      return;
    }

    if (user && form.email && form.email !== user.email) {
      alert("Email mismatch detected. Please refresh the page and try again.");
      return;
    }

    if (!form.craneType || !form.name || !form.phone || !form.pickupAddress || !form.date) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      navigate("/Payment", { state: form });
      setIsSubmitting(false);
    }, 500);
  };

if (!isLoggedIn) {
    return (
      <div className="book-vps-booking-page">
        <div className="book-vps-booking-container">
          <div className="book-vps-login-required">
            <div className="book-vps-login-required-icon">🔐</div>
            <h2>Login Required</h2>
            <p>Please login to book a crane service</p>
            <button onClick={() => navigate("/Login")} className="book-vps-login-btn">Login Now</button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect admin users - they cannot book cranes
  if (user && user.role === "admin") {
    return (
      <div className="book-vps-booking-page">
        <div className="book-vps-booking-container">
          <div className="book-vps-login-required">
            <div className="book-vps-login-required-icon">🚫</div>
            <h2>Access Restricted</h2>
            <p>Admins cannot book crane services. Please use the admin dashboard.</p>
            <button onClick={() => navigate("/admin/dashboard")} className="book-vps-login-btn">Go to Admin Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-vps-booking-page">
      <div className="book-vps-booking-container">
        <div className="book-vps-booking-header">
          <h1>Book a Crane</h1>
          <p>Professional crane rental services for your construction and industrial needs</p>
        </div>

        <div className="book-vps-booking-content">
          <div className="book-vps-crane-selection">
            <h2>🚜 Select Crane Type</h2>
            {craneLoading ? (
              <div className="book-vps-loading-container">
                Loading cranes...
              </div>
            ) : craneTypes.length === 0 ? (
              <div className="book-vps-empty-message">
                <p>No cranes available</p>
                <p>Please contact us to book a crane</p>
              </div>
            ) : (
              <div className="book-vps-crane-grid">
                {craneTypes.map((crane) => (
                  <div
                    key={crane.id}
                    className={`book-vps-crane-option ${form.craneType === crane.id ? 'book-vps-selected' : ''} ${!crane.isAvailable ? 'book-vps-unavailable' : ''}`}
                    onClick={() => handleCraneSelect(crane.id)}
                  >
                    <img src={crane.img} alt={crane.name} />
                    <h3>{crane.name}</h3>
                    <p>{crane.capacity}</p>
                    <p className="book-vps-price">{crane.price}</p>
                    <p className={`book-vps-availability ${crane.isAvailable ? 'book-vps-available' : 'book-vps-busy'}`}>
                      {crane.isAvailable ? '✓ Available' : `⏳ Busy (${crane.busyHours} hours)`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="book-vps-booking-box">
            <h2>📋 Booking Details</h2>
            <span className="book-vps-subtitle">Fill in your details to proceed to payment</span>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Full Name * <span className="book-vps-profile-note">(from profile)</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  readOnly={isLoggedIn && user}
                  required
                />
              </div>

              <div className="book-vps-form-grid">
                <div>
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} required />
                </div>
                <div>
                  <label>Email * <span className="book-vps-profile-note">(from profile)</span></label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    readOnly={isLoggedIn && user}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Map Section */}
              <div className="book-vps-location-section">
                <label>Work Location *</label>
                
                {locationError && (
                  <div className="book-vps-location-error">
                    {locationError}
                  </div>
                )}

                {/* Location Selection Mode Buttons */}
                <div className="book-vps-location-methods">
                  <button
                    type="button"
                    className={`book-vps-location-btn book-vps-active-${activeSelection === 'pickup'}`}
                    onClick={() => setActiveSelection('pickup')}
                  >
                    📍 Pickup Location {pickupCoords && '✓'}
                  </button>
                  <button
                    type="button"
                    className={`book-vps-location-btn book-vps-active-${activeSelection === 'destination'}`}
                    onClick={() => setActiveSelection('destination')}
                  >
                    🏁 Destination {destinationCoords && '✓'}
                  </button>
                  <button type="button" className="book-vps-location-btn" onClick={getCurrentLocation}>
                    📍 GPS Location
                  </button>
                </div>

                {/* Search Box */}
                <div className="book-vps-search-wrapper">
                  <input
                    type="text"
                    placeholder={`Search for ${activeSelection === 'pickup' ? 'pickup' : 'destination'} location...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="book-vps-search-input"
                  />
                  {searching && <div className="book-vps-searching">⏳</div>}
                  
                  {searchResults.length > 0 && (
                    <div className="book-vps-search-results">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="book-vps-search-result"
                          onClick={() => handleSelectSearchResult(result)}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Map */}
                <div className="book-vps-map-wrapper">
                  <MapContainer 
                    key={mapKey}
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenterHandler center={mapCenter} />
                    <MapBoundsHandler pickupCoords={pickupCoords} destinationCoords={destinationCoords} />
                    <MapClickHandler onMapClick={handleMapClick} />
                    
                    {pickupCoords && (
                      <Marker position={pickupCoords} icon={pickupIcon}>
                        <Popup><strong>📍 Pickup Location</strong><br />{form.pickupAddress || 'Selected location'}</Popup>
                      </Marker>
                    )}
                    
                    {destinationCoords && (
                      <Marker position={destinationCoords} icon={destinationIcon}>
                        <Popup><strong>🏁 Destination</strong><br />{form.destination || 'Selected location'}</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>

                {/* Selected Locations Display */}
                <div className="book-vps-selected-locations">
                  <div className="book-vps-location-display">
                    <span className="book-vps-pickup-icon">📍</span>
                    <div>
                      <small className="book-vps-location-label">Pickup:</small>
                      <div>{form.pickupAddress || 'Not set - click on map to select'}</div>
                    </div>
                  </div>
                  {form.destination && (
                    <div className="book-vps-location-display">
                      <span className="book-vps-destination-icon">🏁</span>
                      <div>
                        <small className="book-vps-location-label">Destination:</small>
                        <div>{form.destination}</div>
                      </div>
                    </div>
                  )}
                </div>

                <input type="hidden" name="pickupAddress" value={form.pickupAddress} onChange={handleChange} />
                <input type="hidden" name="destination" value={form.destination} onChange={handleChange} />
              </div>

              <div className="book-vps-form-grid">
                <div>
                  <label>Preferred Date *</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={form.date} 
                    onChange={handleChange} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                <div>
                  <label>Hours Required</label>
                  <select name="hours" value={form.hours} onChange={handleChange}>
                    <option value="">Select hours</option>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Additional Details</label>
                <textarea name="description" placeholder="Describe your requirements..." value={form.description} onChange={handleChange} rows="3"></textarea>
              </div>

              <button type="submit" disabled={isSubmitting || !form.craneType} className="book-vps-submit-btn">
                {isSubmitting ? 'Processing...' : 'Proceed to Payment →'}
              </button>
            </form>

            <div className="book-vps-contact-info-box">
              <p>Need urgent booking? Call us directly:</p>
              <a href="tel:+919876543210" className="book-vps-phone-link">📞 +91 98765 43210</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookCrane;
