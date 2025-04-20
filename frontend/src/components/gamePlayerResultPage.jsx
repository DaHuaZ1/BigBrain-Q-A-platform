import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Stack,
  Typography,
  Box,
  Divider,
  Paper,
  Button
} from '@mui/material';

const GamePlayerResultPage = () => {
  const navigate = useNavigate();  
  const { playerId } = useParams();
  const [resultData, setResultData] = useState([]);
  const [error, setError] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  //Hi, Mingxuan
  //Because the backend GET /play/{playerId}/results does NOT return a 'score' field.
  //To work around this, I stored each question's ID and point value in localStorage during gameplay
  //(inside GameWaitAndPlayPage), using a structure like: { [questionId]: points }.
  //Then, in this component, I retrieve that localStorage data and combine it with the backend's
  //returned answers (which include questionId and Iscorrect?) to compute and display the total score.
  //Hope this logic helps when you're building the admin result view or the history page!
  // Feel free to reach out if anything is unclear
  //—— Yuxin

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5005/play/${playerId}/results`);
        const data = await res.json();

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
        console.error('error:', err);
        setError('Failed to fetch game results');
      }
    };

    fetchResults();
  }, [playerId]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
      Game Results
      </Typography>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Stack spacing={2}>
        {resultData.map((r, i) => (
          <Paper key={i} elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Question {r.qid}</strong>
            </Typography>

            <Typography variant="body2" color="text.secondary">
            Score: <strong>{r.point}</strong>
            </Typography>

            <Typography
              variant="body2"
              color={r.correct ? 'success.main' : 'error.main'}
            >
            Result: <strong>{r.correct ? 'Correct' : 'Wrong'}</strong>
            </Typography>

            <Typography variant="body2" color="text.secondary">
            Time: {r.timeTaken !== null ? `${r.timeTaken}s` : 'N/A'}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="h5" align="center" gutterBottom>
         Total Score: {totalScore}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{
              color: 'black',
              borderColor: 'black',
              '&:hover': {
                backgroundColor: 'black',
                color: 'white',
              },
              px: 4,
              py: 1.2,
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
          Return Home Page
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default GamePlayerResultPage;

