import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

const GamePlayerResultPage = () => {
  const { playerId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5005/play/${playerId}/results`);
        const data = await res.json();
        console.log('Game results from backend:', data);
        setResultData(data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setError('Failed to fetch game results');
      }
    };

    fetchResults();
  }, [playerId]);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Game Results
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

    </Box>
  );
};

export default GamePlayerResultPage;
