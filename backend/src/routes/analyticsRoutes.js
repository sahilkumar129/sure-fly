const express = require("express");
const { getBusiestPeriod, getMostTraveled } = require("../controllers/analyticsController");

const router = express.Router();

// POST /api/analytics/busiest-period
router.post("/busiest-period", getBusiestPeriod);

// POST /api/analytics/most-traveled
router.post("/most-traveled", getMostTraveled);

module.exports = router;
