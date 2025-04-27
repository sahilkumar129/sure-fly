import React from 'react';

// Helper function to format duration (e.g., PT2H30M -> 2h 30m)
const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
};

// Helper function to format date/time
const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
        return new Date(dateTime).toLocaleString();
    } catch {
        return dateTime; // Return original if parsing fails
    }
};

function FlightResults({ flights, isRoundTrip }) {
  if (!flights || flights.length === 0) {
    return <p>No flight data to display.</p>;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Top {flights.length} Flights (Sorted by Available Seats)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc', background: '#f9f9f9' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Seats</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Price ({flights[0]?.currency || 'USD'})</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Outbound</th>
            {isRoundTrip && <th style={{ padding: '8px', textAlign: 'left' }}>Return</th>}
            <th style={{ padding: '8px', textAlign: 'left' }}>Last Ticketing Date</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>{flight.seats}</td>
              <td style={{ padding: '8px' }}>{flight.price}</td>
              <td style={{ padding: '8px' }}>
                {flight.outbound.map((seg, index) => (
                  <div key={index} style={{ marginBottom: '5px'}}>
                     <strong>{seg.from} → {seg.to}</strong> ({seg.airline} {seg.flightNumber})<br />
                     <small>Dep: {formatDateTime(seg.departureTime)} | Arr: {formatDateTime(seg.arrivalTime)} | Dur: {formatDuration(seg.duration)}</small>
                  </div>
                ))}
              </td>
              {isRoundTrip && (
                 <td style={{ padding: '8px' }}>
                    {flight.return.map((seg, index) => (
                      <div key={index} style={{ marginBottom: '5px'}}>
                        <strong>{seg.from} → {seg.to}</strong> ({seg.airline} {seg.flightNumber})<br />
                        <small>Dep: {formatDateTime(seg.departureTime)} | Arr: {formatDateTime(seg.arrivalTime)} | Dur: {formatDuration(seg.duration)}</small>
                      </div>
                    ))}
                  </td>
              )}
               <td style={{ padding: '8px' }}>{flight.lastTicketingDate || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FlightResults;
