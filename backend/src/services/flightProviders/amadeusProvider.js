const axios = require("axios");
const { getAccessToken } = require("../amadeusAuth");
const { DateTime } = require("luxon");

// Read base URL from environment
const AMADEUS_BASE_URL = process.env.AMADEUS_API_BASE_URL || "https://test.api.amadeus.com";
const FLIGHT_OFFERS_ENDPOINT = `${AMADEUS_BASE_URL}/v2/shopping/flight-offers`;
const FLIGHT_INSPIRATION_ENDPOINT = `${AMADEUS_BASE_URL}/v1/shopping/flight-destinations`;
const FLIGHT_BUSIEST_PERIOD_ENDPOINT = `${AMADEUS_BASE_URL}/v1/travel/analytics/air-traffic/busiest-period`;
const FLIGHT_MOST_TRAVELED_ENDPOINT = `${AMADEUS_BASE_URL}/v1/travel/analytics/air-traffic/traveled`;

// --- Helper function to transform Amadeus flight data ---
const transformFlightData = (flightOffer) => {
  // Helper to extract segments from an itinerary
  const extractSegments = (itinerary) =>
    itinerary.segments.map((s) => ({
      from: s.departure.iataCode,
      to: s.arrival.iataCode,
      airline: s.carrierCode,
      flightNumber: s.number,
      departureTime: s.departure.at,
      arrivalTime: s.arrival.at,
      duration: s.duration,
    }));

  const outboundSegments = flightOffer.itineraries[0]
    ? extractSegments(flightOffer.itineraries[0])
    : [];
  const returnSegments = flightOffer.itineraries[1]
    ? extractSegments(flightOffer.itineraries[1])
    : [];

  return {
    id: flightOffer.id,
    price: flightOffer.price.total,
    currency: flightOffer.price.currency,
    seats: flightOffer.numberOfBookableSeats || 0,
    lastTicketingDate: flightOffer.lastTicketingDate,
    outbound: outboundSegments,
    return: returnSegments, // Will be empty for one-way
  };
};

// --- One-Way Flight Search ---
const searchOneWayFlights = async ({ origin, destination, departureDate, airlineCode }) => {
  const token = await getAccessToken();

  if (!origin || !destination || !departureDate) {
    throw new Error("Origin, Destination, and Departure Date are required for one-way search.");
    // Note: Amadeus Flight Offers Search API requires a destination.
    // For open destination, a different API (like Flight Inspiration Search) would be needed,
    // potentially followed by specific searches for top destinations found.
    // This implementation sticks to specific destination searches.
  }

  const params = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: departureDate,
    adults: 1,
    nonStop: false, // Or make this configurable
    max: 50, // Fetch more to allow sorting by seats
    currencyCode: "USD", // Example, make configurable if needed
  };

  if (airlineCode) {
    params.includedAirlineCodes = airlineCode;
  }

  try {
    console.log(`Calling Amadeus Flight Offers: ${FLIGHT_OFFERS_ENDPOINT}`);
    const response = await axios.get(FLIGHT_OFFERS_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const flights = response.data.data;
    const transformedFlights = flights.map(transformFlightData);

    // Sort by available seats (descending) and take top 20
    const sortedFlights = transformedFlights.sort((a, b) => b.seats - a.seats).slice(0, 20);

    return sortedFlights;
  } catch (error) {
    console.error(
      "Amadeus API Error (One-Way):",
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    // Rethrow or handle specific API errors
    throw new Error(
      `Failed to fetch one-way flights: ${
        error.response?.data?.errors?.[0]?.detail || error.message
      }`
    );
  }
};

// --- Round-Trip Flight Search ---
const searchRoundTripFlights = async ({
  origin,
  destination,
  departureDate,
  returnDate,
  airlineCode,
}) => {
  const token = await getAccessToken();

  if (!origin || !destination || !departureDate || !returnDate) {
    throw new Error(
      "Origin, Destination, Departure Date, and Return Date are required for round-trip search."
    );
  }

  const params = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: departureDate,
    returnDate: returnDate,
    adults: 1,
    nonStop: false,
    max: 50,
    currencyCode: "USD",
  };

  if (airlineCode) {
    params.includedAirlineCodes = airlineCode;
  }

  try {
    console.log(`Calling Amadeus Flight Offers: ${FLIGHT_OFFERS_ENDPOINT}`);
    const response = await axios.get(FLIGHT_OFFERS_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    let flights = response.data.data;

    const transformedFlights = flights.map(transformFlightData);

    const sortedFlights = transformedFlights.sort((a, b) => b.seats - a.seats).slice(0, 20);

    return sortedFlights;
  } catch (error) {
    console.error(
      "Amadeus API Error (Round-Trip):",
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    throw new Error(
      `Failed to fetch round-trip flights: ${
        error.response?.data?.errors?.[0]?.detail || error.message
      }`
    );
  }
};

// --- Flight Inspiration Search (Open Destination) ---
const searchFlightInspirations = async ({ origin, departureDate, oneWay = true }) => {
  const token = await getAccessToken();

  if (!origin) {
    throw new Error("Origin is required for flight inspiration search.");
  }

  // Note: Flight Inspiration Search has different parameters.
  // It primarily works with departureDate ranges or specific dates.
  // It doesn't directly support a returnDate in the same way Flight Offers does.
  // We can query for round trips by omitting oneWay=true, but it still focuses on destinations.
  const params = {
    origin: origin,
    // departureDate format YYYY-MM-DD or YYYY-MM
    departureDate: departureDate || DateTime.now().toFormat("yyyy-MM-dd"), // Default to today if not provided
    oneWay: oneWay, // Set to false for round-trip inspiration, though less common
    // duration: can specify trip duration for round trips, e.g., '1 TO 15' days
    // maxPrice: can filter by price
  };

  try {
    console.log(`Calling Amadeus Flight Inspiration: ${FLIGHT_INSPIRATION_ENDPOINT}`);
    const response = await axios.get(FLIGHT_INSPIRATION_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    // Transform the data slightly for consistency/clarity
    const inspirations = response.data.data.map((dest) => ({
      type: dest.type, // typically 'flight-destination'
      origin: dest.origin,
      destination: dest.destination,
      departureDate: dest.departureDate,
      returnDate: dest.returnDate, // Often null for one-way
      price: dest.price.total,
      currency: response.data.meta?.currency || "USD", // Currency might be in meta
      links: dest.links, // Contains link for detailed flight offers (might require separate call)
    }));

    return inspirations; // Return the list of destination suggestions
  } catch (error) {
    console.error(
      "Amadeus API Error (Flight Inspiration):",
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    throw new Error(
      `Failed to fetch flight inspirations: ${
        error.response?.data?.errors?.[0]?.detail || error.message
      }`
    );
  }
};

// --- Get Busiest Traveling Period ---
const getBusiestTravelPeriod = async ({ cityCode, period, direction }) => {
  const token = await getAccessToken();

  // Parameter names match the API docs: cityCode, period, direction
  const params = {
    cityCode: cityCode, // This is the city being analyzed
    period: period, // Year YYYY
    direction: direction, // ARRIVING or DEPARTING (relative to cityCode)
  };

  try {
    console.log(
      `Calling Amadeus Busiest Period: ${FLIGHT_BUSIEST_PERIOD_ENDPOINT} with params:`,
      params
    );
    const response = await axios.get(FLIGHT_BUSIEST_PERIOD_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    // Check for empty data array
    if (
      !response.data.data ||
      !Array.isArray(response.data.data) ||
      response.data.data.length === 0
    ) {
      console.warn("Amadeus Busiest Period API returned success but with empty data array.");
      return {
        type: "no-data",
        message: `No busiest period data found for city ${params.cityCode} in ${params.period} (Direction: ${params.direction}).`,
        query: params,
      };
    }

    // Process the entire array
    const periodData = response.data.data;

    const rankedPeriods = periodData
      .map((item) => {
        // Ensure item has the expected structure AND a numeric score
        if (
          !item ||
          !item.period ||
          typeof item.analytics?.travelers?.score !== "number" // *** Stricter check ***
        ) {
          console.warn(
            "Skipping invalid item (missing period or non-numeric score) in busiest period response:",
            item
          );
          return null; // Skip invalid items
        }
        const [year, month] = item.period.split("-");
        return {
          type: item.type,
          period: item.period, // YYYY-MM
          monthName: DateTime.fromObject({ month: parseInt(month) }).toFormat("MMMM"),
          year: year,
          score: item.analytics.travelers.score,
        };
      })
      .filter((item) => item !== null)
      // *** Sort by score ascending (least busy first) ***
      .sort((a, b) => a.score - b.score);

    return {
      type: "busiest-periods-ranked",
      results: rankedPeriods,
      query: params,
    };
  } catch (error) {
    console.error(
      "Amadeus API Error (Busiest Period):",
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    if (error.response) {
      error.message = `Failed to fetch busiest period: ${
        error.response?.data?.errors?.[0]?.detail || error.message
      }`;
      throw error;
    } else {
      throw new Error(`Failed to fetch busiest period: ${error.message}`);
    }
  }
};

// --- Get Most Traveled Destinations ---
const getMostTraveledDestinations = async ({ originCityCode, period, max, sort }) => {
  const token = await getAccessToken();

  // Parameter names match the API docs
  const params = {
    originCityCode: originCityCode,
    period: period, // Format YYYY-MM
    max: max, // Max number of results
    sort: sort, // Sorting criteria (e.g., analytics.flights.score)
    // Note: API docs mention other optional params like countryCode, fields etc.
  };

  try {
    console.log(
      `Calling Amadeus Most Traveled Destinations: ${FLIGHT_MOST_TRAVELED_ENDPOINT} with params:`,
      params
    );
    const response = await axios.get(FLIGHT_MOST_TRAVELED_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    // Check for empty data array
    if (
      !response.data.data ||
      !Array.isArray(response.data.data) ||
      response.data.data.length === 0
    ) {
      console.warn("Amadeus Most Traveled API returned success but with empty data array.");
      return {
        type: "no-data",
        message: `No most traveled destination data found for origin ${params.originCityCode} in ${params.period}.`,
        query: params,
      };
    }

    // Data is already sorted by the API based on the 'sort' param.
    // We can directly return the results.
    // Optionally, we could add city/country names here via another API call if needed later.

    return {
      type: "most-traveled-destinations",
      results: response.data.data, // The array of destinations with scores
      query: params,
    };
  } catch (error) {
    console.error(
      "Amadeus API Error (Most Traveled Destinations):",
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    if (error.response) {
      error.message = `Failed to fetch most traveled destinations: ${
        error.response?.data?.errors?.[0]?.detail || error.message
      }`;
      throw error;
    } else {
      throw new Error(`Failed to fetch most traveled destinations: ${error.message}`);
    }
  }
};

module.exports = {
  searchOneWayFlights,
  searchRoundTripFlights,
  searchFlightInspirations,
  getBusiestTravelPeriod,
  getMostTraveledDestinations,
};
