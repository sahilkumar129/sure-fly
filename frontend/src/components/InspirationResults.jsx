import React from 'react';

function InspirationResults({ inspirations, selectedDestinations, onSelectionChange }) {

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const updatedSelection = new Set(selectedDestinations);
    if (checked) {
      updatedSelection.add(value);
    } else {
      updatedSelection.delete(value);
    }
    onSelectionChange(updatedSelection);
  };

  if (!inspirations || inspirations.length === 0) {
    return <p>No destination suggestions found.</p>;
  }

  return (
    <div>
      <h4>Destination Suggestions</h4>
      <p>Select destinations below to fetch detailed flight offers:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {inspirations.map((insp) => (
          <li key={insp.destination} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <label>
              <input
                type="checkbox"
                value={insp.destination} // The IATA code
                checked={selectedDestinations.has(insp.destination)}
                onChange={handleCheckboxChange}
                style={{ marginRight: '0.5rem' }}
              />
              <strong>{insp.destination}</strong> - Price approx: {insp.price} {insp.currency}
              {/* Optionally display departure/return dates if needed */}
               {/* <small> (Dep: {insp.departureDate} {insp.returnDate ? `| Ret: ${insp.returnDate}` : ''})</small> */}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InspirationResults;
