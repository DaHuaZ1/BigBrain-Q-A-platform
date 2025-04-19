import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameSnake from './GameSnake';
import {
  Typography,
  Box,
  Button
} from '@mui/material';

const GameWaitPage = () => {
  const navigate = useNavigate();
  const { playerId, sessionId } = useParams();
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);


  useEffect(() => {
    let intervalId = null;

    const checkGameStatus = () => {
      fetch(`http://localhost:5005/play/${playerId}/status`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch status');
          return res.json();
        })
        .then((data) => {
          console.log('IS Started?', data.started);
          if (data.started) {
            setGameStarted(true);
            //Stop polling if the game has started
            clearInterval(intervalId);

            navigate(`/play/session/${sessionId}/player/${playerId}/play`);
          }
        })
        .catch((error) => {
          console.error('Error checking game status:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    checkGameStatus();

    // If the game hasn't started yet, set up polling
    intervalId = setInterval(checkGameStatus, 1000);

    return () => clearInterval(intervalId);
  }, [playerId]);

  if (loading) {
    return <div>Loading game status...</div>;
  }

  return (
    <div>
      {gameStarted ? (
        <div>Game Started! Redirecting to the game page...</div>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
         Waiting for the administrator to start the game...
          </Typography>

          <Typography variant="body1" sx={{ mt: 1 }}>
          Bored? try a quick game while you wait!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={() => setActiveGame('snake')}>
        Try Snake
            </Button>
            <Button variant="outlined" onClick={() => setActiveGame(null)}>
        Stop Game
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            {activeGame === 'snake' && (
              <Box sx={{ maxWidth: 400, margin: 'auto' }}>
                <GameSnake />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </div>
  );
};

export default GameWaitPage;


