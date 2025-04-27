import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Grid, CircularProgress,
    Select, MenuItem, FormControl, InputLabel
} from '../../node_modules/@mui/material';

function AnalyticsSearchForm({ onSearch, loading }) {
  const [originCityCode, setOriginCityCode] = useState('');
  const [destinationCityCode, setDestinationCityCode] = useState('');
  const [period, setPeriod] = useState(new Date().getFullYear().toString());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!originCityCode || !destinationCityCode || !period) {
      alert('Please fill in Origin City, Destination City, and Year (YYYY).');
      return;
    }
    if (!/^[A-Z]{3}$/.test(originCityCode.toUpperCase()) || !/^[A-Z]{3}$/.test(destinationCityCode.toUpperCase())) {
       alert('Invalid City Code format. Please use 3-letter IATA city codes.');
       return;
    }
    if (!/^\d{4}$/.test(period)) {
        alert('Invalid Year format. Please use YYYY.');
        return;
    }
    onSearch({ originCityCode, destinationCityCode, period });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom>
        Monthly Traffic Analysis
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
            <TextField label="Origin City Code" variant="outlined" size="small" fullWidth required
                 value={originCityCode}
                 onChange={(e) => setOriginCityCode(e.target.value.toUpperCase())}
                 inputProps={{ maxLength: 3 }}
                 placeholder="e.g., PAR" />
        </Grid>
         <Grid item xs={12} sm={4}>
             <TextField label="Destination City Code" variant="outlined" size="small" fullWidth required
                 value={destinationCityCode}
                 onChange={(e) => setDestinationCityCode(e.target.value.toUpperCase())}
                 inputProps={{ maxLength: 3 }}
                 placeholder="e.g., LON" />
        </Grid>
        <Grid item xs={12} sm={4}>
             <TextField label="Year" variant="outlined" size="small" fullWidth required
                 value={period}
                 onChange={(e) => setPeriod(e.target.value)}
                 inputProps={{ pattern: "\\d{4}", maxLength: 4 }}
                 placeholder="YYYY" 
                 title="Enter year in YYYY format" />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: '200px' }}>
        {loading ? <CircularProgress size={24} /> : 'Get Monthly Traffic Ranking'}
      </Button>
    </Box>
  );
}

export default AnalyticsSearchForm;
