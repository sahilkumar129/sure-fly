require("dotenv").config();
const axios = require("axios");

// Read base URL from environment
const AMADEUS_BASE_URL = process.env.AMADEUS_API_BASE_URL || "https://test.api.amadeus.com";
const TOKEN_ENDPOINT = `${AMADEUS_BASE_URL}/v1/security/oauth2/token`;

// Store the token and its expiry time
let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

async function getAccessToken() {
  const now = Date.now();

  // Return cached token if it's still valid (with a small buffer)
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 60000) {
    console.log("Using cached Amadeus token");
    return tokenCache.accessToken;
  }

  console.log(`Fetching new Amadeus token from ${TOKEN_ENDPOINT}...`);
  try {
    const response = await axios.post(
      TOKEN_ENDPOINT,
      {
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, expires_in } = response.data;
    // Cache the new token and calculate expiry time (expires_in is in seconds)
    tokenCache = {
      accessToken: access_token,
      expiresAt: now + expires_in * 1000,
    };
    return access_token;
  } catch (error) {
    console.error(
      "Error fetching Amadeus access token:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to authenticate with Amadeus API");
  }
}

module.exports = { getAccessToken };
