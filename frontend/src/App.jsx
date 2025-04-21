import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
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
import { SnackbarProvider } from 'notistack';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

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


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={1000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <BrowserRouter>
        <ScrollToTop />
        <Bar token={token} setToken={setToken} />
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
        <ScrollTopButton />
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;
