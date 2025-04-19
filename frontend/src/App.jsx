import Login from './components/loginPage';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './components/registerPage';
import Bar from './components/Bar';
import { useState } from 'react';
import Home from './components/homePage';
import Dashboard from './components/Dashboard';
import SingleGame from './components/singleGame';
import { SnackbarProvider } from 'notistack';
import SingleQuestion from './components/singleQuestion';
import GameJoinPage from './components/gameJoinPage';
import SessionPage from './components/sessionPage';
import GameWaitPage from './components/gameWaitPage';
import GamePlayPage from './components/gamePlayPage';

function App() {
  const[token, setToken]=useState(localStorage.getItem('token'));
  return (
    // Route Jump Related Code
    <SnackbarProvider maxSnack={3} autoHideDuration={1000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <BrowserRouter>
        <Bar token={token} setToken={setToken} />
        <Routes>
          <Route path="/" element={<Home token={token}/>} />
          <Route path="/login" element={<Login setToken={setToken}/>} />
          <Route path="/signup" element={<Signup setToken={setToken}/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:game_id" element={<SingleGame />} />
          <Route path="/game/:game_id/question/:question_id" element={<SingleQuestion />} />
          <Route path='/game/:game_id/session/:session_id' element={<SessionPage />} />
          <Route path="/play" element={<GameJoinPage />} />
          <Route path="/play/session/:sessionId" element={<GameJoinPage />} />
          <Route path="/play/wait/session/:sessionId/player/:playerId" element={<GameWaitPage />} />
          <Route path="/play/session/:sessionId/player/:playerId/play" element={<GamePlayPage />} />
        </Routes>

      </BrowserRouter>
    </SnackbarProvider>
  )
}

export default App
