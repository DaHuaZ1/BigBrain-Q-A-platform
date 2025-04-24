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
import backendURL from '../backendURL';

/**
 * GamePlayerResultPage Component
 * Displays a player's game results after completing a quiz
 * Shows question-by-question results, scores, and timing information
 */
const GamePlayerResultPage = () => {
  const navigate = useNavigate();  
  const { playerId } = useParams();
  const [resultData, setResultData] = useState([]);
  const [error, setError] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  /**
   * Note about the score calculation implementation:
   * Since the backend GET /play/{playerId}/results does NOT return a 'score' field,
   * we use the following approach:
   * 1. During gameplay (in GameWaitAndPlayPage), we store each question's ID and point value in localStorage
   * 2. In this component, we retrieve that data and combine it with backend answers
   * 3. We then compute the total score based on correctness and timing
   */

  /**
   * Fetches and processes player results from the backend
   * Computes scores based on correctness, time taken, and question point values
   * Combines backend data with locally stored question information
   */
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch basic results data from backend
        const res = await fetch(`${backendURL}/play/${playerId}/results`);
        const data = await res.json();

        // Retrieve locally stored question points information
        const questionPoints = JSON.parse(localStorage.getItem('questionPoints') || '{}');
        let scoreSum = 0;

        // Enrich the results data with points, timing, and score calculations
        const enriched = data.map((result, index) => {
          const qid = String(index + 1); 
          const point = questionPoints[qid]?.points ?? 0;
          const duration = questionPoints[qid]?.duration ?? 0;
          const timeTaken = (new Date(result.answeredAt) - new Date(result.questionStartedAt)) / 1000;

          // Calculate earned score based on correctness and time taken
          let earnedScore = 0;
          if (result.correct) {
            const remaining = Math.max(0, duration - timeTaken);
            earnedScore = parseFloat((point * (remaining / 60)).toFixed(1));
            scoreSum += earnedScore;
          }

          return {
            ...result,
            qid,
            point,
            earnedScore,
            timeTaken: isNaN(timeTaken) ? null : timeTaken.toFixed(2),
          };
        });

        setResultData(enriched);
        setTotalScore(scoreSum);
      } catch (err) {
        setError('Failed to fetch game results',err);
      }
    };

    fetchResults();
  }, [playerId]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Page title */}
      <Typography variant="h4" align="center" gutterBottom>
      Game Results
      </Typography>

      {/* Error message if results couldn't be fetched */}
      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* List of individual question results */}
      <Stack spacing={2}>
        {resultData.map((r, i) => (
          <Paper key={i} elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Question {r.qid}</strong>
            </Typography>

            <Typography variant="body2" color="text.secondary">
            Score: <strong>{r.point}</strong>
            </Typography>

            <Typography variant="body2" color="primary">
            Earned Score: <strong>{r.earnedScore}</strong>
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

      {/* Summary section with total score and explanations */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 2 }} />

        {/* Total score display */}
        <Typography variant="h5" align="center" gutterBottom>
         Total Score: {totalScore}
        </Typography>

        {/* Scoring explanation note */}
        <Typography
          variant="body2"
          sx={{
            backgroundColor: "#fff8c5",
            border: "1px solid #ffe58f",
            color: "#ad6800",
            borderRadius: 2,
            p: 1.5,
            mt: 2,
            mb: 3,
            textAlign: 'center',
            fontWeight: 500
          }}
        >
          ⚠️ Score = Question Points x Remaining Time (in minutes). The faster you answer, the more you earn!
        </Typography>

        {/* Additional scoring information */}
        <Typography
          variant="body2"
          sx={{
            backgroundColor: "#fefefe",
            borderLeft: "4px solid #ffccc7",
            borderRight: "4px solid #ffccc7",
            color: "#cf1322",
            borderRadius: 2,
            p: 1.5,
            mb: 3,
            textAlign: 'center',
            fontWeight: 500,
            fontStyle: 'italic',
          }}
        >
          ℹ️ You may get a score lower than the question points if question time is shorter than 1 minute.
        </Typography>

        {/* Navigation button to return home */}
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

