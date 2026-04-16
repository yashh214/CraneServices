import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import Navbar from "./Components/Navbar.js";
import Footer from "./Components/Footer.js";
import ScrollToTop from "./Components/ScrollToTop.js";
import Home from "./pages/Home.js";
import Contact from "./pages/Contact.js";
import About from "./pages/About.js";
import Login from "./pages/Login.js";
import AdminLogin from "./pages/AdminLogin.js";
import Signup from "./pages/Signup.js";
import Bookcrane from "./pages/Bookcrane.js";
import CraneGallery from "./pages/CraneGallery.js";
import Payment from "./pages/Payment.js";
import Dashboard from "./pages/Dashboard.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import AdminBookings from "./pages/AdminBookings.js";
import AdminPayments from "./pages/AdminPayments.js";
import AdminCustomers from "./pages/AdminCustomers.js";
import AdminCranes from "./pages/AdminCranes.js";
import AdminFeedback from "./pages/AdminFeedback.js";
import AdminContacts from "./pages/AdminContacts.js";
import Feedback from "./pages/Feedback.js";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/About" element={<About/>} />
          <Route path="/Login" element={<Login/>} />
          <Route path="/admin/login" element={<AdminLogin/>} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/cranes" element={<AdminCranes />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/contacts" element={<AdminContacts />} />
          <Route path="/Signup" element={<Signup/>} />
          <Route path="/Bookcrane" element={<Bookcrane/>} />
          <Route path="/CraneGallery" element={<CraneGallery />} />
          <Route path="/Payment" element={<Payment />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/feedback" element={<Feedback />} />

        </Routes>
         <Footer/>
      </Router>
    </AuthProvider>
    
  );
}

export default App;
