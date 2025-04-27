import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Container from '../node_modules/@mui/material/Container';
import HomePage from './pages/HomePage';
import NavBar from './components/NavBar';

function App() {

  return (
    <>
      <NavBar />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add other routes here if needed */}
        </Routes>
      </Container>
    </>
  )
}

export default App;
