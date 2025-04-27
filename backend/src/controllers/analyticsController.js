const amadeusProvider = require("../services/flightProviders/amadeusProvider");

const getBusiestPeriod = async (req, res, next) => {
  try {
    const { cityCode, period, direction } = req.body;

    // Basic validation
    if (!cityCode || !period || !direction) {
      return res.status(400).json({
        message: "Missing required fields: cityCode, period (YYYY), direction (ARRIVING/DEPARTING)",
      });
    }
    if (!/^[A-Z]{3}$/.test(cityCode.toUpperCase())) {
      return res
        .status(400)
        .json({ message: "Invalid cityCode format. Please use 3-letter IATA city code." });
    }
    if (!/^\d{4}$/.test(period)) {
      return res.status(400).json({ message: "Invalid period format. Please use YYYY." });
    }
    if (!["ARRIVING", "DEPARTING"].includes(direction.toUpperCase())) {
      return res.status(400).json({ message: "Invalid direction. Use ARRIVING or DEPARTING." });
    }

    const params = {
      cityCode: cityCode.toUpperCase(),
      period,
      direction: direction.toUpperCase(),
    };
    console.log("Controller: Getting busiest period with params:", params);

    const result = await amadeusProvider.getBusiestTravelPeriod(params);

    // Check for no-data first
    if (result && result.type === "no-data") {
      return res.status(404).json({
        message: result.message,
        query: result.query,
      });
    }

    // Check for the expected ranked type
    if (result && result.type === "busiest-periods-ranked") {
      // Send the successful result containing the ranked array
      res.json(result);
    } else {
      // Handle unexpected response type from provider
      console.error("Unexpected response type from getBusiestTravelPeriod:", result);
      return res.status(500).json({ message: "Internal server error processing analytics data." });
    }
  } catch (error) {
    console.error("Error in getBusiestPeriod controller:", error);
    if (error.message.startsWith("Failed to fetch")) {
      return res
        .status(502)
        .json({ message: "Error fetching analytics data from provider.", details: error.message });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({
        message: `No busiest period data found or invalid input. (Amadeus Status: 404)`,
        details: error.response?.data?.errors?.[0]?.detail || error.message,
      });
    }
    if (error.response?.status === 400) {
      return res.status(400).json({
        message: `Invalid parameters provided to Amadeus. (Amadeus Status: 400)`,
        details: error.response?.data?.errors?.[0]?.detail || error.message,
      });
    }
    if (error.message.includes("required for")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// --- Controller for Most Traveled Destinations ---
const getMostTraveled = async (req, res, next) => {
  try {
    const { originCityCode, period, max = 10, sort = "analytics.travelers.score" } = req.body;

    // Basic validation
    if (!originCityCode || !period) {
      return res.status(400).json({
        message: "Missing required fields: originCityCode, period (YYYY-MM)",
      });
    }
    if (!/^[A-Z]{3}$/.test(originCityCode.toUpperCase())) {
      return res
        .status(400)
        .json({ message: "Invalid originCityCode format. Please use 3-letter IATA city code." });
    }
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ message: "Invalid period format. Please use YYYY-MM." });
    }
    // Validate sort parameter
    const validSortFields = ["analytics.flights.score", "analytics.travelers.score"];
    if (!validSortFields.includes(sort)) {
      return res
        .status(400)
        .json({ message: `Invalid sort parameter. Use one of: ${validSortFields.join(", ")}` });
    }

    const params = {
      originCityCode: originCityCode.toUpperCase(),
      period,
      max: parseInt(max, 10), // Ensure max is an integer
      sort,
    };
    console.log("Controller: Getting most traveled destinations with params:", params);

    const result = await amadeusProvider.getMostTraveledDestinations(params);

    // Check for no-data
    if (result && result.type === "no-data") {
      return res.status(404).json({
        message: result.message,
        query: result.query,
      });
    }

    // Check for expected type
    if (result && result.type === "most-traveled-destinations") {
      res.json(result);
    } else {
      console.error("Unexpected response type from getMostTraveledDestinations:", result);
      return res.status(500).json({ message: "Internal server error processing analytics data." });
    }
  } catch (error) {
    console.error("Error in getMostTraveled controller:", error);
    if (error.message.startsWith("Failed to fetch")) {
      return res.status(502).json({
        message: "Error fetching most traveled data from provider.",
        details: error.message,
      });
    }
    if (error.response?.status === 400) {
      // Handles 400s from Amadeus (e.g., invalid parameter values)
      return res.status(400).json({
        message: `Invalid parameters provided to Amadeus Most Traveled API. (Amadeus Status: 400)`,
        details: error.response?.data?.errors?.[0]?.detail || error.message,
      });
    }
    // No specific 404 handling needed here as empty data is handled above
    // Fallback for other errors
    next(error);
  }
};

module.exports = {
  getBusiestPeriod,
  getMostTraveled,
};
