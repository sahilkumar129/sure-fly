import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Grid, CircularProgress,
    Select, MenuItem, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio, FormLabel
} from '@mui/material';

function AnalyticsSearchForm({ onSearch, loading }) {
  const [cityCode, setCityCode] = useState('');
  const [period, setPeriod] = useState(new Date().getFullYear().toString());
  const [direction, setDirection] = useState('ARRIVING');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cityCode || !period || !direction) {
      alert('Please fill in City Code, Year (YYYY), and select a Direction.');
      return;
    }
    if (!/^[A-Z]{3}$/.test(cityCode.toUpperCase())) {
       alert('Invalid City Code format. Please use 3-letter IATA city code.');
       return;
    }
    if (!/^\d{4}$/.test(period)) {
        alert('Invalid Year format. Please use YYYY.');
        return;
    }
    onSearch({ cityCode, period, direction });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom>
        Monthly Traffic Analysis
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
            <TextField label="City Code" variant="outlined" size="small" fullWidth required
                 value={cityCode}
                 onChange={(e) => setCityCode(e.target.value.toUpperCase())}
                 inputProps={{ maxLength: 3 }}
                 placeholder="e.g., MAD" />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
             <TextField label="Year" variant="outlined" size="small" fullWidth required
                 value={period}
                 onChange={(e) => setPeriod(e.target.value)}
                 inputProps={{ pattern: "\\d{4}", maxLength: 4 }}
                 placeholder="YYYY"
                 title="Enter year in YYYY format" />
        </Grid>
        <Grid item xs={12} sm={4} md={6}>
            <FormControl component="fieldset" size="small">
                <FormLabel component="legend" sx={{ fontSize: '0.8rem', mb: -0.5 }}>Direction</FormLabel>
                <RadioGroup
                    row
                    aria-label="direction"
                    name="direction-radio-buttons-group"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                 >
                    <FormControlLabel value="ARRIVING" control={<Radio size="small" />} label="Arriving" />
                    <FormControlLabel value="DEPARTING" control={<Radio size="small" />} label="Departing" />
                </RadioGroup>
            </FormControl>
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: '200px' }}>
        {loading ? <CircularProgress size={24} /> : 'Get Monthly Traffic Ranking'}
      </Button>
    </Box>
  );
}

export default AnalyticsSearchForm;
