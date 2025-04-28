import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Box
} from '@mui/material';

function NavBar() {
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
      <Toolbar>
         <Box sx={{ flexGrow: 1 }} />

         <Typography variant="h6" component="div">
           Flight Seat Finder
         </Typography>

         <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
             <Button color="inherit" component={RouterLink} to="/">
                Home
             </Button>
         </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
