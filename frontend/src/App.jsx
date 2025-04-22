// Import core hooks and routing components
import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';

// Import page and UI components
import Login from './components/loginPage';
import Signup from './components/registerPage';
import Bar from './components/Bar';
import Home from './components/homePage';
import Dashboard from './components/Dashboard';
import SingleGame from './components/singleGame';
import SingleQuestion from './components/singleQuestion';
import SessionPage from './components/sessionPage';
import GameJoinPage from './components/gameJoinPage';
import GameWaitAndPlayPage from './components/gameWaitAndPlayPage';
import GamePlayerResultPage from './components/gamePlayerResultPage';
import History from './components/History';

// Snackbar and Material UI components
import { SnackbarProvider } from 'notistack';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// ScrollToTop ensures that every route navigation scrolls the window to top smoothly
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null; // This component does not render anything visually
};

// ScrollTopButton shows a floating button to scroll back to top when user scrolls down
const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false); // Controls visibility of the button

  useEffect(() => {
    // Show the button only after scrolling down 300px
    const toggleVisible = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  // Smooth scroll to top when the button is clicked
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={visible}>
      <Fab
        color="primary"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
        }}
        size="medium"
        aria-label="scroll back to top"
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

// Main App component that defines routes and shared layout
function App() {
  // Auth token state, initialized from localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    // SnackbarProvider allows displaying temporary alerts from anywhere in the app
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={1000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <BrowserRouter>
        {/* Scroll to top on every route change */}
        <ScrollToTop />

        {/* Top navigation bar that receives auth token */}
        <Bar token={token} setToken={setToken} />

        {/* Define all routes for the application */}
        <Routes>
          <Route path="/" element={<Home token={token} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<Signup setToken={setToken} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:game_id" element={<SingleGame />} />
          <Route path="/game/:game_id/question/:question_id" element={<SingleQuestion />} />
          <Route path="/game/:game_id/session/:session_id" element={<SessionPage />} />
          <Route path="/game/history" element={<History />} />
          <Route path="/play" element={<GameJoinPage />} />
          <Route path="/play/session/:sessionId" element={<GameJoinPage />} />
          <Route
            path="/play/session/:sessionId/player/:playerId/game"
            element={<GameWaitAndPlayPage />}
          />
          <Route
            path="/play/session/:sessionId/player/:playerId/result"
            element={<GamePlayerResultPage />}
          />
        </Routes>

        {/* Floating scroll-to-top button shown after scrolling */}
        <ScrollTopButton />
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;
