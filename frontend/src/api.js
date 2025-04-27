import axios from "axios";

// Make sure the backend URL is correct (using the port from backend/.env)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const searchOneWayFlights = (data) => {
  return apiClient.post("/flights/one-way", data);
};

export const searchRoundTripFlights = (data) => {
  return apiClient.post("/flights/round-trip", data);
};

export const getBusiestTravelPeriod = (data) => {
  // Expects data = { originCityCode, destinationCityCode, period, direction }
  return apiClient.post("/analytics/busiest-period", data);
};

export const getMostTraveledDestinations = (data) => {
  // Expects data = { originCityCode, period, max?, sort? }
  return apiClient.post("/analytics/most-traveled", data);
};
