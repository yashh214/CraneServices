import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./PaymentHome.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking } = useAuth();
  const bookingData = location.state || {};

  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const paymentMethods = [
    {
      id: "upi",
      icon: "📱",
      label: "UPI Payment",
      detail: "Google Pay, PhonePe, Paytm",
      upiId: "ganeshcrane@okhdfcbank"
    },
    {
      id: "bank",
      icon: "🏦",
      label: "Bank Transfer",
      detail: "NEFT/RTGS/IMPS",
      bankDetails: {
        bank: "HDFC Bank",
        account: "123456789012",
        ifsc: "HDFC0001234",
        branch: "Dhule Main"
      }
    },
    {
      id: "cod",
      icon: "💵",
      label: "Cash on Delivery",
      detail: "Pay after service completion"
    },
    {
      id: "card",
      icon: "💳",
      label: "Card Payment",
      detail: "Credit/Debit Card"
    }
  ];

  // Calculate hourly rates and total amount based on hours
  const hourlyRates = {
    "Hydra Crane": 8000,
    "Mobile Crane": 15000,
    "Heavy Crane": 25000,
    "Tower Crane": 18000,
    "All-Terrain Crane": 30000,
    "Crawler Crane": 80000,
    "Rough Terrain Crane": 10000,
    "Truck Crane": 5000
  };

  const hours = parseInt(bookingData.hours) || 0;
  const craneType = bookingData.craneType || "";
  const ratePerHour = hourlyRates[craneType] || 0;
  const totalAmount = ratePerHour * hours;

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        const bookingPayload = {
          ...bookingData,
          paymentMethod: selectedPayment,
          amount:
            totalAmount > 0
              ? `₹${totalAmount.toLocaleString()}`
              : bookingData.craneType === "Hydra Crane"
              ? "₹8,000"
              : bookingData.craneType === "Mobile Crane"
              ? "₹15,000"
              : "₹25,000",
        };

        const newBooking = await addBooking(bookingPayload);
        console.log("Booking saved:", newBooking);
        setPaymentSuccess(true);
      } catch (err) {
        console.error("Error saving booking", err);
        alert("There was an error saving your booking. Please try again.");
      } finally {
        setIsProcessing(false);
        // Redirect to dashboard after success or failure
        setTimeout(() => {
          navigate("/Dashboard");
        }, 2000);
      }
    }, 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="payy-page">
      <div className="payy-container">
        
        {/* Back Button */}
        <button className="payy-back-btn" onClick={handleBack}>
          ← Back to Booking
        </button>

        {/* Success Message */}
        {paymentSuccess ? (
          <div className="payy-success">
            <div className="payy-success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your crane has been booked. Check your dashboard for tracking.</p>
          </div>
        ) : (
          <>
            {/* Booking Summary */}
            <div className="payy-summary">
              <h2>📋 Booking Summary</h2>
              <div className="payy-summary-details">
                <div className="payy-summary-row">
                  <span className="payy-summary-label">Name:</span>
                  <span className="payy-summary-value">{bookingData.name || "N/A"}</span>
                </div>
                <div className="payy-summary-row">
                  <span className="payy-summary-label">Phone:</span>
                  <span className="payy-summary-value">{bookingData.phone || "N/A"}</span>
                </div>
                <div className="payy-summary-row">
                  <span className="payy-summary-label">📍 Pickup Location:</span>
                  <span className="payy-summary-value">{bookingData.pickupAddress || bookingData.location || "N/A"}</span>
                </div>
                {bookingData.destination && (
                  <div className="payy-summary-row">
                    <span className="payy-summary-label">🏁 Destination:</span>
                    <span className="payy-summary-value">{bookingData.destination || "N/A"}</span>
                  </div>
                )}
                <div className="payy-summary-row">
                  <span className="payy-summary-label">Crane Type:</span>
                  <span className="payy-summary-value">{bookingData.craneType || "N/A"}</span>
                </div>
                <div className="payy-summary-row">
                  <span className="payy-summary-label">Date:</span>
                  <span className="payy-summary-value">{bookingData.date || "N/A"}</span>
                </div>
                <div className="payy-summary-row">
                  <span className="payy-summary-label">Hours:</span>
                  <span className="payy-summary-value">{bookingData.hours ? `${bookingData.hours} Hours` : "N/A"}</span>
                </div>
                <div className="payy-summary-row">
                  <span className="payy-summary-label">Rate per Hour:</span>
                  <span className="payy-summary-value">{ratePerHour > 0 ? `₹${ratePerHour.toLocaleString()}` : "N/A"}</span>
                </div>
                <div className="payy-summary-row payy-total-amount">
                  <span className="payy-summary-label">Total Amount:</span>
                  <span className="payy-summary-value">{totalAmount > 0 ? `₹${totalAmount.toLocaleString()}` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="payy-section">
              <h2>💳 Select Payment Method</h2>
              <div className="payy-options">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`payy-option ${selectedPayment === method.id ? 'payy-selected' : ''}`}
                    onClick={() => handlePaymentSelect(method.id)}
                  >
                    <div className="payy-radio"></div>
                    <span className="payy-icon">{method.icon}</span>
                    <div className="payy-label">
                      <span>{method.label}</span>
                      <small>{method.detail}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* UPI Apps */}
              {selectedPayment === 'upi' && (
                <div className="payy-details">
                  <p className="payy-upi-id">UPI ID: <strong>{paymentMethods[0].upiId}</strong></p>
                  <div className="payy-apps">
                    <button className="payy-app">GPay</button>
                    <button className="payy-app">PhonePe</button>
                    <button className="payy-app">Paytm</button>
                    <button className="payy-app">BHIM</button>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {selectedPayment === 'bank' && (
                <div className="payy-details payy-bank-details">
                  <h4>Bank Transfer Details</h4>
                  <p><strong>Bank:</strong> {paymentMethods[1].bankDetails.bank}</p>
                  <p><strong>Account No:</strong> {paymentMethods[1].bankDetails.account}</p>
                  <p><strong>IFSC:</strong> {paymentMethods[1].bankDetails.ifsc}</p>
                  <p><strong>Branch:</strong> {paymentMethods[1].bankDetails.branch}</p>
                  <p className="payy-note">Please transfer the amount and save the transaction ID for reference.</p>
                </div>
              )}

              {/* COD Info */}
              {selectedPayment === 'cod' && (
                <div className="payy-details">
                  <p className="payy-cod-info">You can pay in cash after our crane arrives at your location. Our team will coordinate with you for the payment.</p>
                </div>
              )}

              {/* Card Info */}
              {selectedPayment === 'card' && (
                <div className="payy-details">
                  <p className="payy-card-info">Card payment option will be available soon. For now, please use UPI or Bank Transfer.</p>
                </div>
              )}
            </div>

            {/* Pay Now Button */}
            <button 
              className="payy-pay-btn" 
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="payy-processing">Processing...</span>
              ) : (
                <>Pay Now ✅</>
              )}
            </button>

            {/* Contact Info */}
            <div className="payy-contact-box">
              <p>Need help with payment? Call us:</p>
              <a href="tel:+919876543210">📞 +91 98765 43210</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Payment;
