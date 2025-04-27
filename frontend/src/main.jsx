import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '../node_modules/@mui/material/CssBaseline/index.js'
// Import MUI Theme components
import { ThemeProvider, createTheme } from '../node_modules/@mui/material/styles/index.js'

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
        <CssBaseline /> {/* CssBaseline should be inside ThemeProvider */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
