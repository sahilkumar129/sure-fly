# Flight Seat Finder & Analytics SaaS

This project allows users to search for flights (one-way/round-trip), discover potential destinations, and view flight analytics based on Amadeus API data.

## Features

*   **Flight Search:**
    *   Search for specific **one-way** or **round-trip** flights between origin and destination airports.
    *   Results show the **top 20 flight options** sorted by the highest number of available seats (Note: Amadeus often caps reported seats at 9+, so multiple flights might show '9').
    *   Optional filtering by preferred airline.
*   **Open Destination Search:**
    *   If the destination airport is left blank, the app uses the Amadeus Flight Inspiration API to suggest potential destinations from the origin for the given date(s).
    *   Users can select multiple suggested destinations to then fetch detailed flight offers for those routes.
*   **Flight Analytics:**
    *   **Monthly Traffic Ranking:** View historical air traffic volume between two cities for a given year, ranked month-by-month from least busy to most busy based on traveler scores.
    *   **Most Traveled Destinations:** Find the top historically traveled destinations from a specific origin city for a given month (YYYY-MM), sortable by traveler volume or number of flights.

## Project Structure

*   `/backend`: Contains the Node.js/Express API server.
    *   `src/`: Source code (Controllers, Routes, Services, Providers).
    *   `.env`: Environment variables (needs Amadeus API key/secret/base URL).
    *   `package.json`: Backend dependencies.
*   `/frontend`: Contains the React/Vite frontend application.
    *   `src/`: Source code (Components, Pages, API client).
    *   `package.json`: Frontend dependencies.
*   `README.md`: This file.

## Prerequisites

*   Node.js and npm (or yarn)
*   Amadeus API Credentials (for Self-Service APIs: https://developers.amadeus.com/) - You'll need keys for both Test and Production environments eventually.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd flight-booking
    ```
2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Configure Backend Environment:**
    *   Create a `.env` file in the `/backend` directory.
    *   Add your Amadeus API Key, Secret, and the Base URL (Test or Production):
      ```env
      AMADEUS_API_KEY=YOUR_API_KEY_HERE
      AMADEUS_API_SECRET=YOUR_API_SECRET_HERE
      AMADEUS_API_BASE_URL=https://test.api.amadeus.com # For testing
      # AMADEUS_API_BASE_URL=https://api.amadeus.com # For production
      PORT=5001 # Or your preferred port
      ```
4.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

## Running the Application

1.  **Start the Backend Server (Development Mode):**
    *   Open a terminal in the `/backend` directory.
    ```bash
    npm run start:dev
    ```
    *   The API server will start (usually on port 5001) and automatically restart on file changes via `nodemon`.

2.  **Start the Frontend Development Server:**
    *   Open *another* terminal in the `/frontend` directory.
    ```bash
    npm run dev
    ```
    *   Vite will start the development server (typically on port 5173 - check terminal output).

3.  **Access the Application:**
    *   Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

## API Endpoints (Backend)

*   `POST /api/flights/one-way`:
    *   **With Destination:** Searches for one-way flight offers.
        *   Body: `{ "origin": "LHR", "destination": "CDG", "departureDate": "YYYY-MM-DD", "airlineCode": "BA" (optional) }`
        *   Response: `{ "searchType": "offers", "results": [ ...detailed flight offers... ] }`
    *   **Without Destination:** Searches for destination inspirations.
        *   Body: `{ "origin": "LHR", "departureDate": "YYYY-MM-DD" }`
        *   Response: `{ "searchType": "inspirations", "results": [ ...destination suggestions... ] }`
*   `POST /api/flights/round-trip`:
    *   **With Destination:** Searches for round-trip flight offers.
        *   Body: `{ "origin": "LHR", "destination": "CDG", "departureDate": "YYYY-MM-DD", "returnDate": "YYYY-MM-DD", "airlineCode": "BA" (optional) }`
        *   Response: `{ "searchType": "offers", "results": [ ...detailed flight offers... ] }`
    *   **Without Destination:** Searches for destination inspirations (round-trip context).
        *   Body: `{ "origin": "LHR", "departureDate": "YYYY-MM-DD" }`
        *   Response: `{ "searchType": "inspirations", "results": [ ...destination suggestions... ] }`
*   `POST /api/analytics/monthly-traffic`: Gets historical traffic ranking for a route.
    *   Body: `{ "originCityCode": "LON", "destinationCityCode": "PAR", "period": "YYYY" }`
    *   Response: `{ "type": "monthly-traffic", "results": [ ...monthly scores ranked... ], "query": ... }` or `{ "type": "no-data", ... }`
*   `POST /api/analytics/most-traveled`: Gets top traveled destinations from an origin.
    *   Body: `{ "originCityCode": "PAR", "period": "YYYY-MM", "max": 15 (optional, default 10), "sort": "analytics.flights.score" (optional, default travelers) }`
    *   Response: `{ "type": "most-traveled-destinations", "results": [ ...top destinations ranked... ], "query": ... }` or `{ "type": "no-data", ... }`


## Notes

*   **Seat Availability Cap:** Amadeus Flight Offers Search often reports a maximum of '9' available seats (`numberOfBookableSeats: 9`), meaning "9 or more".
*   **Test Data Limitations:** The Amadeus **Test** environment has limited data, especially for the analytics APIs (Inspiration, Traffic, Most Traveled). You may receive "no data found" responses frequently during testing, even for valid queries. Functionality should be more robust in the Production environment.
*   **UI Library:** The frontend uses Material UI (MUI) for components and styling.
*   **Error Handling:** Basic error handling is implemented. Can be improved. 