const express = require("express");
const router = express.Router();
const paymentController = require("../controller/PaymentController");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// create payment (user)
router.post("/", auth, paymentController.createPayment);

// admin routes
router.get("/all", auth, adminAuth, paymentController.getAllPayments);
router.get("/totals", auth, adminAuth, paymentController.getPaymentTotals);
// optionally allow admin to fetch payments for any user
router.get("/user/:id", auth, paymentController.getUserPayments);
// User can fetch their own payments
router.get("/my", auth, paymentController.getUserPayments);

module.exports = router;
