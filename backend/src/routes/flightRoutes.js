const express = require("express");
const { searchOneWay, searchRoundTrip } = require("../controllers/flightController");

const router = express.Router();

// POST /api/flights/one-way
router.post("/one-way", searchOneWay);

// POST /api/flights/round-trip
router.post("/round-trip", searchRoundTrip);

module.exports = router;
