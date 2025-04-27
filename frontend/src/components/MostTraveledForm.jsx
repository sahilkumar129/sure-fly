import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Grid, CircularProgress,
    Select, MenuItem, FormControl, InputLabel
} from '../../node_modules/@mui/material';

const DEFAULT_MAX = 10;
const DEFAULT_SORT = 'analytics.travelers.score';

function MostTraveledForm({ onSearch, loading }) {
  const [originCityCode, setOriginCityCode] = useState('');
  const [period, setPeriod] = useState( // Default to previous month YYYY-MM
      new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)
  );
  const [max, setMax] = useState(DEFAULT_MAX);
  const [sort, setSort] = useState(DEFAULT_SORT);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!originCityCode || !period) {
      alert('Please fill in Origin City Code and Period (YYYY-MM).');
      return;
    }
     if (!/^[A-Z]{3}$/.test(originCityCode.toUpperCase())) {
       alert('Invalid Origin City Code format. Please use 3-letter IATA city code.');
       return;
    }
    if (!/^\d{4}-\d{2}$/.test(period)) {
        alert('Invalid Period format. Please use YYYY-MM.');
        return;
    }
    onSearch({ originCityCode, period, max: parseInt(max) || DEFAULT_MAX, sort });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
       <Typography variant="h6" gutterBottom>
         Most Traveled Destinations
        </Typography>
       <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
              <TextField label="Origin City Code" variant="outlined" size="small" fullWidth required
                   value={originCityCode}
                   onChange={(e) => setOriginCityCode(e.target.value.toUpperCase())}
                   inputProps={{ maxLength: 3 }}
                   placeholder="e.g., PAR" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <TextField label="Period" type="month" variant="outlined" size="small" fullWidth required
                   value={period}
                   onChange={(e) => setPeriod(e.target.value)}
                   InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <TextField label="Max Results" type="number" variant="outlined" size="small" fullWidth
                   value={max}
                   onChange={(e) => setMax(e.target.value)}
                   inputProps={{ min: 1, max: 50 }}
                   placeholder={`Default ${DEFAULT_MAX}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                    labelId="sort-select-label"
                    id="sort-select"
                    value={sort}
                    label="Sort By"
                    onChange={(e) => setSort(e.target.value)}
                 >
                    <MenuItem value="analytics.travelers.score">Travelers</MenuItem>
                    <MenuItem value="analytics.flights.score">Flights</MenuItem>
                </Select>
              </FormControl>
          </Grid>
      </Grid>
      <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: '200px' }}>
        {loading ? <CircularProgress size={24} /> : 'Find Top Destinations'}
      </Button>
    </Box>
  );
}

export default MostTraveledForm;
