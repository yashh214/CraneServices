const API_BASE_URL = "http://localhost:8000/user";
const BOOKING_BASE_URL = "http://localhost:8000/booking";

// Helper function for making API calls
const fetchAPI = async (baseUrlEndpoint, method = "GET", body = null, token = null) => {
  // baseUrlEndpoint is full path including base url
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(baseUrlEndpoint, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// User Authentication APIs
export const loginAPI = (email, password) => {
  return fetchAPI(`${API_BASE_URL}/login`, "POST", { email, password });
};

export const signupAPI = (name, email, password) => {
  return fetchAPI(`${API_BASE_URL}/signup`, "POST", { name, email, password });
};

// User Management APIs
export const getUsersAPI = (token) => {
  return fetchAPI(`${API_BASE_URL}/getalluser`, "GET", null, token);
};

export const getUserCountAPI = () => {
  return fetchAPI(`${API_BASE_URL}/count`, "GET");
};

export const searchUserAPI = (keyword, token) => {
  return fetchAPI(`${API_BASE_URL}/searchuser?keyword=${keyword}`, "GET", null, token);
};

export const updateUserAPI = (id, userData, token) => {
  return fetchAPI(`${API_BASE_URL}/update/${id}`, "PUT", userData, token);
};

export const deleteUserAPI = (id, token) => {
  return fetchAPI(`${API_BASE_URL}/user/${id}`, "DELETE", null, token);
};

export const getUserByIdAPI = (id, token) => {
  return fetchAPI(`${API_BASE_URL}/users/${id}`, "GET", null, token);
};


// Booking APIs
export const createBookingAPI = (bookingData, token) => {
  return fetchAPI(`${BOOKING_BASE_URL}/book`, "POST", bookingData, token);
};

export const getMyBookingsAPI = (token) => {
  return fetchAPI(`${BOOKING_BASE_URL}/my`, "GET", null, token);
};

export const getAllBookingsAPI = (token) => {
  return fetchAPI(`${BOOKING_BASE_URL}/all`, "GET", null, token);
};

// payment endpoints
export const createPaymentAPI = (paymentData, token) => {
  return fetchAPI(`http://localhost:8000/payment/`, "POST", paymentData, token);
};

export const getAllPaymentsAPI = (token) => {
  return fetchAPI(`http://localhost:8000/payment/all`, "GET", null, token);
};

export const getPaymentTotalsAPI = (token) => {
  return fetchAPI(`http://localhost:8000/payment/totals`, "GET", null, token);
};

export const getUserPaymentsAPI = (userId, token) => {
  return fetchAPI(`http://localhost:8000/payment/user/${userId}`, "GET", null, token);
};

// User's own payments
export const getMyPaymentsAPI = (token) => {
  return fetchAPI(`http://localhost:8000/payment/my`, "GET", null, token);
};

// Helper function for multipart form data (image uploads)
const fetchMultipartAPI = async (url, method = "POST", formData = null, token = null) => {
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (formData) {
    options.body = formData;
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Crane Management APIs
export const getAllCranesAPI = () => {
  return fetchAPI(`http://localhost:8000/crane/`, "GET");
};

export const getCraneByIdAPI = (id) => {
  return fetchAPI(`http://localhost:8000/crane/${id}`, "GET");
};

export const createCraneAPI = (craneData, token) => {
  // Create FormData for multipart upload
  const formData = new FormData();
  
  // Append all text fields
  if (craneData.name) formData.append("name", craneData.name);
  if (craneData.type) formData.append("type", craneData.type);
  if (craneData.capacity) formData.append("capacity", craneData.capacity);
  if (craneData.hourlyRate) formData.append("hourlyRate", craneData.hourlyRate);
  if (craneData.description) formData.append("description", craneData.description);
  if (craneData.location) formData.append("location", craneData.location);
  if (craneData.registrationNo) formData.append("registrationNo", craneData.registrationNo);
  if (craneData.notes) formData.append("notes", craneData.notes);
  
  // Append image if exists
  if (craneData.image) {
    formData.append("image", craneData.image);
  }

  return fetchMultipartAPI(`http://localhost:8000/crane/`, "POST", formData, token);
};

export const updateCraneAPI = (id, craneData, token) => {
  // Create FormData for multipart upload
  const formData = new FormData();
  
  // Append all text fields
  if (craneData.name) formData.append("name", craneData.name);
  if (craneData.type) formData.append("type", craneData.type);
  if (craneData.capacity) formData.append("capacity", craneData.capacity);
  if (craneData.hourlyRate) formData.append("hourlyRate", craneData.hourlyRate);
  if (craneData.description) formData.append("description", craneData.description);
  if (craneData.location) formData.append("location", craneData.location);
  if (craneData.registrationNo) formData.append("registrationNo", craneData.registrationNo);
  if (craneData.notes) formData.append("notes", craneData.notes);
  if (craneData.availability !== undefined) formData.append("availability", craneData.availability);
  
  // Append image if exists and is a File object
  if (craneData.image && craneData.image instanceof File) {
    formData.append("image", craneData.image);
  }

  return fetchMultipartAPI(`http://localhost:8000/crane/${id}`, "PUT", formData, token);
};

export const deleteCraneAPI = (id, token) => {
  return fetchAPI(`http://localhost:8000/crane/${id}`, "DELETE", null, token);
};

export const toggleCraneAvailabilityAPI = (id, token) => {
  return fetchAPI(`http://localhost:8000/crane/${id}/toggle-availability`, "PATCH", {}, token);
};

// Booking Status APIs
export const completeBookingAPI = (id, token) => {
  return fetchAPI(`http://localhost:8000/booking/${id}/complete`, "PATCH", {}, token);
};

export const cancelBookingAPI = (id, reason, token) => {
  return fetchAPI(`http://localhost:8000/booking/${id}/cancel`, "PATCH", { reason }, token);
};

// User cancel their own booking
export const userCancelBookingAPI = (id, reason, token) => {
  return fetchAPI(`http://localhost:8000/booking/my/${id}/cancel`, "PATCH", { reason }, token);
};

// Stats APIs (public)
export const getStatsAPI = () => {
  return fetchAPI(`http://localhost:8000/stats/`, "GET");
};

// Contact APIs
export const createContactAPI = (contactData) => {
  return fetchAPI(`http://localhost:8000/contact`, "POST", contactData);
};

export const getAllContactsAPI = (token) => {
  return fetchAPI(`http://localhost:8000/contact/all`, "GET", null, token);
};

export const getContactByIdAPI = (id, token) => {
  return fetchAPI(`http://localhost:8000/contact/${id}`, "GET", null, token);
};

export const updateContactStatusAPI = (id, status, token) => {
  return fetchAPI(`http://localhost:8000/contact/${id}/status`, "PUT", { status }, token);
};

export const deleteContactAPI = (id, token) => {
  return fetchAPI(`http://localhost:8000/contact/${id}`, "DELETE", null, token);
};

// Feedback APIs
export const createFeedbackAPI = (feedbackData, token) => {
  return fetchAPI(`http://localhost:8000/feedback`, "POST", feedbackData, token);
};

export const getPublicFeedbackAPI = () => {
  return fetchAPI(`http://localhost:8000/feedback/public`, "GET");
};

export const getAllFeedbackAPI = (token) => {
  return fetchAPI(`http://localhost:8000/feedback/all`, "GET", null, token);
};

export const updateFeedbackStatusAPI = (id, isApproved, token) => {
  return fetchAPI(`http://localhost:8000/feedback/${id}/status`, "PUT", { isApproved }, token);
};

export const deleteFeedbackAPI = (id, token) => {
  return fetchAPI(`http://localhost:8000/feedback/${id}`, "DELETE", null, token);
};

export default {
  loginAPI,
  signupAPI,
  getUsersAPI,
  getUserCountAPI,
  searchUserAPI,
  updateUserAPI,
  deleteUserAPI,
  getUserByIdAPI,
  createBookingAPI,
  getMyBookingsAPI,
  getAllBookingsAPI,
  createPaymentAPI,
  getAllPaymentsAPI,
  getPaymentTotalsAPI,
  getUserPaymentsAPI,
  getMyPaymentsAPI,
  getAllCranesAPI,
  getCraneByIdAPI,
  createCraneAPI,
  updateCraneAPI,
  deleteCraneAPI,
  toggleCraneAvailabilityAPI,
  completeBookingAPI,
  cancelBookingAPI,
  userCancelBookingAPI
};

