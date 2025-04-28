require("dotenv").config();
const express = require("express");
const cors = require("cors");
const flightRoutes = require("./routes/flightRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { scheduleJob } = require("./jobs/flightChecker");

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Allow requests from frontend (adjust origin in production)
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/flights", flightRoutes);
app.use("/api/analytics", analyticsRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.send("Flight Booking API is running!");
});

// Global error handler (optional basic example)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  scheduleJob();
});
