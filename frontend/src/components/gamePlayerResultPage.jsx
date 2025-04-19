import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Divider } from '@mui/material';

const GamePlayerResultPage = () => {
  const { playerId } = useParams();
  const [resultData, setResultData] = useState([]);
  const [error, setError] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5005/play/${playerId}/results`);
        const data = await res.json();
        console.log('Game results from backend:', data);

        const questionPoints = JSON.parse(localStorage.getItem('questionPoints') || '{}');
        let scoreSum = 0;

        const enriched = data.map((result, index) => {
          const qid = String(index + 1); 
          const point = questionPoints[qid] ?? 0;
          const timeTaken = (new Date(result.answeredAt) - new Date(result.questionStartedAt)) / 1000;

          if (result.correct) {
            scoreSum += point;
          }

          return {
            ...result,
            qid,
            point,
            timeTaken: isNaN(timeTaken) ? null : timeTaken.toFixed(2),
          };
        });

        setResultData(enriched);
        setTotalScore(scoreSum);
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

      {resultData.map((r, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Typography variant="h6">Question {r.qid}</Typography>
          <Typography>Score for this question: {r.point}</Typography>
          <Typography>Is it correct: {r.correct ? 'Yes' : 'No'}</Typography>
          <Typography>
            Answer time: {r.timeTaken !== null ? `${r.timeTaken} seconds` : 'N/A'}
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Box>
      ))}

      <Typography variant="h5" sx={{ mt: 4 }}>
        Total Score: {totalScore}
      </Typography>
    </Box>
  );
};

export default GamePlayerResultPage;

