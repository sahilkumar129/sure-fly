import React from 'react';

function AnalyticsResultsDisplay({ results }) {
  // Expect results structure: { type: 'busiest-periods-ranked', results: [...], query: {...} }
  if (!results || results.type !== 'busiest-periods-ranked') {
    return null;
  }

  const { results: rankedPeriods, query } = results;

  if (!rankedPeriods || rankedPeriods.length === 0) {
      return <p>No busiest period data found for the specified criteria.</p>;
  }

  const directionText = query.direction === 'DEPARTING'
    ? `departing from ${query.cityCode}`
    : `arriving at ${query.cityCode}`;

  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      {/* Updated Title to use period */}
      <h4>Monthly Traffic Ranking ({query.period})</h4>
      <p>
        {/* Updated Description based on score sorting */}
        Historical analysis for travel <strong>{directionText}</strong>
        in the period <strong>{query.period}</strong>,
        ranked from least busy (lowest score) to most busy (highest score).
      </p>
      <ol style={{ paddingLeft: '20px' }}>
        {rankedPeriods.map((periodData) => (
          <li key={periodData.period} style={{ marginBottom: '0.3rem' }}>
            <strong>{periodData.monthName}</strong> ({periodData.period}) -
            {/* Display the score with a check */}
            Score: {typeof periodData.score === 'number' ? periodData.score.toFixed(0) : 'N/A'} / 100
          </li>
        ))}
      </ol>
      {/* Updated small text */}
      <small>Score is relative (0-100), based on Amadeus historical data analysis.</small>
      {/* Removed note about chronological sorting */}
    </div>
  );
}

export default AnalyticsResultsDisplay;
