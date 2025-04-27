require("dotenv").config();
const express = require("express");
const cors = require("cors");
const flightRoutes = require("./routes/flightRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const port = process.env.PORT || 5000;

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
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
