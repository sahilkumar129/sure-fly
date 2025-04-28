import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
// Import MUI Theme components
import { ThemeProvider, createTheme } from '@mui/material/styles'
// Import MUI Date Picker Localization
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Define a basic dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // You can customize primary/secondary colors here later if needed
    // primary: { main: '#90caf9' },
    // secondary: { main: '#f48fb1' },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Apply the theme */}
      <ThemeProvider theme={darkTheme}>
        {/* Apply Date Localization */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline /> {/* CssBaseline should be inside ThemeProvider */}
          <App />
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
