import React, { useState, useCallback } from 'react';
import {
  getBusiestTravelPeriod,
  getMostTraveledDestinations,
  searchOneWayFlights,
  searchRoundTripFlights,
} from '../api';
// MUI Imports
import {
    Box, Typography, RadioGroup, FormControlLabel, Radio, TextField,
    Button, Checkbox, CircularProgress, Alert, AlertTitle,
    Tabs, Tab, Grid, Stack, FormControl, FormLabel
} from '../../node_modules/@mui/material';
// Keep custom components (assuming they will be refactored or don't use Chakra)
import FlightResults from '../components/FlightResults';
import InspirationResults from '../components/InspirationResults';
import AnalyticsSearchForm from '../components/AnalyticsSearchForm'; // Renamed to MonthlyTrafficForm later?
import AnalyticsResultsDisplay from '../components/AnalyticsResultsDisplay'; // Renamed to MonthlyTrafficResults later?
import MostTraveledForm from '../components/MostTraveledForm';
import MostTraveledResults from '../components/MostTraveledResults';

// Helper component for TabPanel content (required by MUI Tabs)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}> {/* Add padding top */} 
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function HomePage() {
    // Tab state
    const [tabIndex, setTabIndex] = useState(0);

    // --- Flight Search State --- 
    const [searchType, setSearchType] = useState('oneWay');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [airlineCode, setAirlineCode] = useState('');
    const [searchResultType, setSearchResultType] = useState('none');
    const [flightOffers, setFlightOffers] = useState([]);
    const [flightInspirations, setFlightInspirations] = useState([]);
    const [selectedDestinations, setSelectedDestinations] = useState(new Set());
    const [loadingStage1, setLoadingStage1] = useState(false);
    const [loadingStage2, setLoadingStage2] = useState(false);

    // --- Monthly Traffic Analytics State ---
    const [monthlyTrafficResult, setMonthlyTrafficResult] = useState(null);
    const [loadingMonthlyTraffic, setLoadingMonthlyTraffic] = useState(false);

    // --- Most Traveled Analytics State ---
    const [mostTraveledResult, setMostTraveledResult] = useState(null);
    const [loadingMostTraveled, setLoadingMostTraveled] = useState(false);

    // Common UI state
    const [error, setError] = useState(null);

    // --- Handlers ---
    const clearResults = () => {
        setError(null);
        setFlightOffers([]);
        setFlightInspirations([]);
        setSelectedDestinations(new Set());
        setSearchResultType('none');
        setMonthlyTrafficResult(null);
        setMostTraveledResult(null);
    };

    const handleTabsChange = (event, newValue) => {
        setTabIndex(newValue);
        clearResults(); 
    };

    const handleSearchTypeChange = (event) => {
        setSearchType(event.target.value);
    };

    // Flight Search - Stage 1
    const handleSearch = async (e) => {
        e.preventDefault();
        clearResults();
        setLoadingStage1(true);
        setError(null);
        setFlightOffers([]);
        setFlightInspirations([]);
        setSelectedDestinations(new Set());
        setSearchResultType('none');

        const commonParams = {
            origin,
            departureDate,
            airlineCode: airlineCode || undefined,
        };

        try {
            let response;
            const apiCallParams = destination
                ? { ...commonParams, destination, returnDate: searchType === 'roundTrip' ? returnDate : undefined }
                : commonParams;

            const apiFunction = searchType === 'oneWay' ? searchOneWayFlights : searchRoundTripFlights;

            if (!origin || !departureDate) {
                setError("Origin and Departure Date are required.");
                setLoadingStage1(false);
                return;
            }
            if (destination && searchType === 'roundTrip' && !returnDate) {
                setError("Return Date is required for round-trip offer search.");
                setLoadingStage1(false);
                return;
            }

            response = await apiFunction(apiCallParams);

            const { searchType: type, results } = response.data;

            if (type === 'offers') {
                setFlightOffers(results);
                setSearchResultType('offers');
            } else if (type === 'inspirations') {
                setFlightInspirations(results);
                setSearchResultType('inspirations');
            } else {
                setSearchResultType('none');
            }

        } catch (err) {
            console.error("Search failed:", err);
            setError(err.response?.data?.message || 'Failed to fetch data. Check console for details.');
            setSearchResultType('none');
        } finally {
            setLoadingStage1(false);
        }
    };

    // Flight Search - Stage 2
    const handleSearchSelectedDestinations = async () => {
        if (selectedDestinations.size === 0) {
            setError("Please select at least one destination to search for detailed flights.");
            return;
        }
        setLoadingStage2(true);
        setError(null);
        setFlightOffers([]);

        const destinationsToSearch = Array.from(selectedDestinations);
        const promises = [];
        const apiFunction = searchType === 'oneWay' ? searchOneWayFlights : searchRoundTripFlights;

        console.log(`Stage 2: Fetching offers for destinations: ${destinationsToSearch.join(', ')}`);

        for (const dest of destinationsToSearch) {
            const params = {
                origin,
                destination: dest,
                departureDate,
                returnDate: searchType === 'roundTrip' ? returnDate : undefined,
                airlineCode: airlineCode || undefined,
            };
            promises.push(apiFunction(params));
        }

        try {
            const responses = await Promise.all(promises);
            let combinedOffers = [];
            responses.forEach(response => {
                if (response.data.searchType === 'offers' && Array.isArray(response.data.results)) {
                    combinedOffers = combinedOffers.concat(response.data.results);
                } else {
                    console.warn("Unexpected response structure in stage 2:", response.data);
                }
            });

            const sortedOffers = combinedOffers
                .sort((a, b) => b.seats - a.seats)
                .slice(0, 20);

            setFlightOffers(sortedOffers);
            setSearchResultType('offers');
            setFlightInspirations([]);
            setSelectedDestinations(new Set());

        } catch (err) {
            console.error("Stage 2 search failed:", err);
            setError(err.response?.data?.message || 'Failed to fetch detailed flights for selected destinations.');
            setSearchResultType('none');
        } finally {
            setLoadingStage2(false);
        }
    };

    // Flight Inspiration Selection Change
    const handleInspirationSelectionChange = useCallback((updatedSelection) => {
        setSelectedDestinations(updatedSelection);
    }, []);

    // Monthly Traffic Search (using renamed BusiestPeriod API call)
    const handleMonthlyTrafficSearch = async (params) => {
        console.log("Performing monthly traffic search with:", params);
        clearResults();
        setLoadingMonthlyTraffic(true);
        try {
            const response = await getBusiestTravelPeriod(params); // Correct API function
            setMonthlyTrafficResult(response.data);
        } catch (err) {
            console.error("Monthly Traffic search failed:", err);
            setError(err.response?.data?.message || 'Failed to fetch monthly traffic data.');
            setMonthlyTrafficResult(null);
        } finally {
            setLoadingMonthlyTraffic(false);
        }
    };

    // Most Traveled Destinations Search
    const handleMostTraveledSearch = async (params) => {
        console.log("Performing most traveled search with:", params);
        clearResults();
        setLoadingMostTraveled(true);
        try {
            const response = await getMostTraveledDestinations(params);
            setMostTraveledResult(response.data);
        } catch (err) {
            console.error("Most Traveled search failed:", err);
            setError(err.response?.data?.message || 'Failed to fetch most traveled destinations data.');
            setMostTraveledResult(null);
        } finally {
            setLoadingMostTraveled(false);
        }
    };


    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabsChange} aria-label="basic tabs example">
                    <Tab label="Flight Search" {...a11yProps(0)} />
                    <Tab label="Monthly Traffic Rank" {...a11yProps(1)} />
                    <Tab label="Most Traveled Destinations" {...a11yProps(2)} />
                </Tabs>
            </Box>

            {/* --- Flight Search Panel --- */}
            <TabPanel value={tabIndex} index={0}>
                <Box component="form" onSubmit={handleSearch} noValidate sx={{ mt: 1 }}>
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                         <RadioGroup row aria-label="search-type" name="search-type-group" value={searchType} onChange={handleSearchTypeChange}>
                             <FormControlLabel value="oneWay" control={<Radio />} label="One Way" />
                             <FormControlLabel value="roundTrip" control={<Radio />} label="Round Trip" />
                         </RadioGroup>
                    </FormControl>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <TextField label="Origin Airport" variant="outlined" size="small" fullWidth required
                                value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())} inputProps={{ maxLength: 3 }} placeholder="e.g., DEL" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <TextField label="Destination Airport" variant="outlined" size="small" fullWidth
                                value={destination} onChange={e => setDestination(e.target.value.toUpperCase())} inputProps={{ maxLength: 3 }} placeholder="(Optional)" />
                        </Grid>
                         <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <TextField label="Departure Date" type="date" variant="outlined" size="small" fullWidth required
                                value={departureDate} onChange={e => setDepartureDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 0.5 }} />
                        </Grid>
                        {searchType === 'roundTrip' && (
                             <Grid item xs={12} sm={6} md={4} lg={2.4}>
                                <TextField label="Return Date" type="date" variant="outlined" size="small" fullWidth required={!!destination}
                                    value={returnDate} onChange={e => setReturnDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 0.5 }} />
                             </Grid>
                        )}
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <TextField label="Airline" variant="outlined" size="small" fullWidth
                                value={airlineCode} onChange={e => setAirlineCode(e.target.value.toUpperCase())} inputProps={{ maxLength: 2 }} placeholder="(Optional)" />
                        </Grid>
                    </Grid>

                    <Button type="submit" variant="contained" disabled={loadingStage1 || loadingStage2} sx={{ minWidth: '200px' }}>
                        {loadingStage1 || loadingStage2 ? <CircularProgress size={24} /> : 'Search Flights / Destinations'}
                    </Button>
                </Box>

                {error && !loadingMonthlyTraffic && !loadingMostTraveled && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        <AlertTitle>Error!</AlertTitle>
                        {error}
                    </Alert>
                )}

                {(loadingStage1 || loadingStage2) && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>}

                <Box sx={{ mt: 3 }}>
                    {searchResultType === 'offers' && !loadingStage1 && !loadingStage2 && (
                        flightOffers.length > 0
                            ? <FlightResults flights={flightOffers} isRoundTrip={searchType === 'roundTrip'} />
                            : <Typography color="text.secondary">No detailed flight offers found for the given criteria.</Typography>
                    )}
                    {searchResultType === 'inspirations' && !loadingStage1 && !loadingStage2 && (
                        flightInspirations.length > 0
                            ? <>
                                <InspirationResults
                                    inspirations={flightInspirations}
                                    selectedDestinations={selectedDestinations}
                                    onSelectionChange={handleInspirationSelectionChange}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleSearchSelectedDestinations}
                                    disabled={selectedDestinations.size === 0 || loadingStage2}
                                    sx={{ mt: 2 }}
                                >
                                    {loadingStage2 ? <CircularProgress size={24} /> : `Get Flight Details for ${selectedDestinations.size} Selected`}
                                </Button>
                            </>
                            : <Typography color="text.secondary">No destination suggestions found for this origin/date.</Typography>
                    )}
                    {searchResultType === 'none' && !loadingStage1 && !loadingStage2 && !error && (
                        <Typography color="text.secondary">Enter search criteria. Leave Destination blank to find possible destinations.</Typography>
                    )}
                </Box>
            </TabPanel>

            {/* --- Monthly Traffic Panel --- */}
             <TabPanel value={tabIndex} index={1}>
                 {/* Assuming AnalyticsSearchForm is refactored for MUI */} 
                 <AnalyticsSearchForm onSearch={handleMonthlyTrafficSearch} loading={loadingMonthlyTraffic} /> 

                 {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        <AlertTitle>Error!</AlertTitle>
                         {error}
                    </Alert>
                 )} 
                 {loadingMonthlyTraffic && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>} 
                 {!loadingMonthlyTraffic && monthlyTrafficResult && ( 
                     <AnalyticsResultsDisplay results={monthlyTrafficResult} /> 
                 )} 
                 {!loadingMonthlyTraffic && !monthlyTrafficResult && !error && (
                      <Typography color="text.secondary" sx={{ mt: 2 }}>Enter origin/destination city codes and year to get monthly traffic ranking.</Typography>
                 )}
             </TabPanel>

            {/* --- Most Traveled Panel --- */}
            <TabPanel value={tabIndex} index={2}>
                {/* Assuming MostTraveledForm is refactored for MUI */} 
                <MostTraveledForm onSearch={handleMostTraveledSearch} loading={loadingMostTraveled} />

                {error && (
                     <Alert severity="error" sx={{ mt: 2 }}>
                        <AlertTitle>Error!</AlertTitle>
                        {error}
                     </Alert>
                 )} 
                 {loadingMostTraveled && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>} 
                 {!loadingMostTraveled && mostTraveledResult && (
                     <MostTraveledResults results={mostTraveledResult} />
                 )}
                 {!loadingMostTraveled && !mostTraveledResult && !error && (
                     <Typography color="text.secondary" sx={{ mt: 2 }}>Enter origin city code and period (YYYY-MM) to find top traveled destinations.</Typography>
                 )}
            </TabPanel>

        </Box>
    );
}

export default HomePage;
