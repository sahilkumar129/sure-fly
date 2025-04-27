import React from 'react';

function MostTraveledResults({ results }) {
  // Expect results structure: { type: 'most-traveled-destinations', results: [...], query: {...} }
  if (!results || results.type !== 'most-traveled-destinations') {
    return null;
  }

  const { results: destinations, query } = results;

  if (!destinations || destinations.length === 0) {
      return <p>No most traveled destination data found for the specified criteria.</p>;
  }

  const sortField = query.sort === 'analytics.travelers.score' ? 'Travelers' : 'Flights';

  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h4>Top {destinations.length} Most Traveled Destinations</h4>
      <p>
        Destinations from <strong>{query.originCityCode}</strong> for period <strong>{query.period}</strong>,
        sorted by <strong>{sortField} Score</strong> (highest first, based on API sort).
      </p>
      <ol style={{ paddingLeft: '20px' }}>
        {destinations.map((destData) => (
          <li key={destData.destination} style={{ marginBottom: '0.3rem' }}>
            <strong>{destData.destination}</strong> - Travelers Score: {destData.analytics?.travelers?.score ?? 'N/A'} | Flights Score: {destData.analytics?.flights?.score ?? 'N/A'}
          </li>
        ))}
      </ol>
      <small>Score is relative (0-100), based on Amadeus historical data analysis.</small>
    </div>
  );
}

export default MostTraveledResults;
