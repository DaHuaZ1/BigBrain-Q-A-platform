import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GamePlayPage = () => {
  const { playerId } = useParams();
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);

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
    intervalId = setInterval(checkGameStatus, 3000);

    return () => clearInterval(intervalId);
  }, [playerId]);

  if (loading) {
    return <div>Loading game status...</div>;
  }

  return (
    <div>
      {gameStarted ? (
        <div>Game Started!</div>
      ) : (
        <div>Waiting for the administrator to start the game...</div>
      )}
    </div>
  );
};

export default GamePlayPage;


