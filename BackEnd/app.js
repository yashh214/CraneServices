require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 8000;


// =============================
// Middleware
// =============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =============================
// MongoDB Connection
// =============================

mongoose
  .connect("mongodb://127.0.0.1:27017/Crane")
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });


// =============================
// Static Folder (Images Upload)
// =============================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// =============================
// Routes
// =============================

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

console.log("Loading user route...");
app.use("/user", require("./routes/UserRoute"));
console.log("Loading booking route...");
app.use("/booking", require("./routes/BookingRoute"));
console.log("Loading payment route...");
app.use("/payment", require("./routes/PaymentRoute"));
console.log("Loading crane route...");
app.use("/crane", require("./routes/CraneRoute"));
console.log("Loading stats route...");
app.use("/stats", require("./routes/StatsRoute"));
console.log("Loading contact route...");
app.use("/contact", require("./routes/ContactRoute"));
console.log("Loading feedback route...");
app.use("/feedback", require("./routes/FeedbackRoute"));
console.log("All routes loaded!");


// =============================
// Default Route
// =============================

app.get("/", (req, res) => {
  res.send("🚀 Crane Service API Running");
});

// Test route for contact
app.get("/test-contact", (req, res) => {
  res.json({ message: "Contact route test works!" });
});


// =============================
// 404 Error Handling (Express 5 compatible)
// =============================

app.use((req, res, next) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});


// =============================
// Server Start
// =============================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});