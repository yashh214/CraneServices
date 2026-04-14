import React, { createContext, useState, useContext, useEffect } from "react";
import { createBookingAPI, getMyBookingsAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async (authToken) => {
    try {
      const res = await getMyBookingsAPI(authToken);
      if (res && res.bookings) {
        // convert mongoose documents to client-friendly shape
        const serverBookings = res.bookings.map(b => ({
          ...b,
          id: b._id,
          trackingId: b.trackingId || `GCS${b._id.slice(-6)}`
        }));
        setBookings(serverBookings);
        localStorage.setItem("bookings", JSON.stringify(serverBookings));
      }
    } catch (err) {
      console.error("Could not fetch bookings", err);
    }
  };

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem("loggedIn");
    const userData = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (loggedIn === "true" && userData && storedToken) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      setToken(storedToken);

      // fetch bookings from backend to keep in sync
      fetchBookings(storedToken);
    }

    // Load bookings from localStorage (will be overwritten if server fetch succeeds)
    const savedBookings = localStorage.getItem("bookings");
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  const login = (userData, authToken) => {
    setIsLoggedIn(true);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);

    // immediately sync bookings
    fetchBookings(authToken);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    setBookings([]);
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("bookings");
  };

  // when called from payment flow - attempts to persist to backend if token is available
  const addBooking = async (booking) => {
    if (token) {
      try {
        const res = await createBookingAPI(booking, token);
        if (res && res.booking) {
          const bk = res.booking;
          const newBooking = {
            ...bk,
            id: bk._id,
            trackingId: `GCS${bk._id.slice(-6)}`,
            status: bk.status
          };
          const updated = [...bookings, newBooking];
          setBookings(updated);
          localStorage.setItem("bookings", JSON.stringify(updated));
          return newBooking;
        }
      } catch (err) {
        console.error("Failed to create booking on server", err);
        // fall through to local fallback
      }
    }

    // fallback to local-only booking
    const newBooking = {
      ...booking,
      id: Date.now(),
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      trackingId: `GCS${Date.now().toString().slice(-6)}`
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    
    return newBooking;
  };

  const getBookingById = (id) => {
    return bookings.find(booking => booking.id === id || booking.id === parseInt(id));
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      token,
      login, 
      logout, 
      bookings, 
      addBooking,
      getBookingById,
      fetchBookings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
