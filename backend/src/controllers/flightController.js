// Placeholder controllers - We will implement the logic using services later

// Import the specific provider service (we might use an interface later for flexibility)
const amadeusProvider = require("../services/flightProviders/amadeusProvider");

const searchOneWay = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, airlineCode } = req.body;

    // Destination is required for detailed flight offers
    if (destination) {
      // --- Standard Flight Offer Search --- Requires Destination
      if (!origin || !departureDate) {
        return res.status(400).json({
          message:
            "Missing required fields: origin, departureDate (and destination for detailed search)",
        });
      }
      // TODO: Add date validation

      const searchParams = { origin, destination, departureDate, airlineCode };
      console.log("Controller: Searching one-way offers with params:", searchParams);

      const flights = await amadeusProvider.searchOneWayFlights(searchParams);
      // Return structure: Array of detailed flight offers
      res.json({ searchType: "offers", results: flights });
    } else {
      // --- Flight Inspiration Search --- No Destination Provided
      if (!origin) {
        return res
          .status(400)
          .json({ message: "Missing required field: origin (for inspiration search)" });
      }
      // Departure date is optional for inspiration, defaults in provider
      const searchParams = { origin, departureDate, oneWay: true };
      console.log("Controller: Searching one-way inspirations with params:", searchParams);

      const inspirations = await amadeusProvider.searchFlightInspirations(searchParams);
      // Return structure: Array of destination suggestions
      res.json({ searchType: "inspirations", results: inspirations });
    }
  } catch (error) {
    console.error("Error in searchOneWay controller:", error);
    if (error.message.startsWith("Failed to fetch")) {
      return res
        .status(502)
        .json({ message: "Error fetching flight data from provider.", details: error.message });
    }
    // Add specific handling for inspiration errors if needed
    if (error.message.includes("required for")) {
      // Covers both offer/inspiration origin/dest requirements
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

const searchRoundTrip = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, returnDate, airlineCode } = req.body;

    if (destination) {
      // --- Standard Round-Trip Offer Search --- Requires Destination
      if (!origin || !departureDate || !returnDate) {
        return res.status(400).json({
          message:
            "Missing required fields: origin, departureDate, returnDate (and destination for detailed search)",
        });
      }
      // TODO: Add date validation

      const searchParams = { origin, destination, departureDate, returnDate, airlineCode };
      console.log("Controller: Searching round-trip offers with params:", searchParams);

      const flights = await amadeusProvider.searchRoundTripFlights(searchParams);
      // Return structure: Array of detailed flight offers
      res.json({ searchType: "offers", results: flights });
    } else {
      // --- Flight Inspiration Search --- No Destination Provided
      if (!origin) {
        return res
          .status(400)
          .json({ message: "Missing required field: origin (for inspiration search)" });
      }
      // Note: Round-trip inspiration is less direct. We pass oneWay: false.
      // Departure date is optional, defaults in provider.
      // Return date isn't directly used by inspiration API but could be used for filtering later if needed.
      const searchParams = { origin, departureDate, oneWay: false };
      console.log("Controller: Searching round-trip inspirations with params:", searchParams);

      const inspirations = await amadeusProvider.searchFlightInspirations(searchParams);
      // Return structure: Array of destination suggestions (may include return dates)
      res.json({ searchType: "inspirations", results: inspirations });
    }
  } catch (error) {
    console.error("Error in searchRoundTrip controller:", error);
    if (error.message.startsWith("Failed to fetch")) {
      return res
        .status(502)
        .json({ message: "Error fetching flight data from provider.", details: error.message });
    }
    if (error.message.includes("required for")) {
      // Covers both offer/inspiration origin/dest requirements
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  searchOneWay,
  searchRoundTrip,
};
