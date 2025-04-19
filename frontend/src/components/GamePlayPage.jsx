import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';

const GamePlayPage = () => {
  const { playerId } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`http://localhost:5005/play/${playerId}/question`);
      const data = await res.json();
      console.log('Question data from backend:', data);
      setQuestionData(data.question);
    //   renderQuestion(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load question');
    }
  };

  //   const renderQuestion = (data) => {
  //     console.log('Rendering question:', data);
  //   };
  
  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (questionData?.duration) {
      setCountdown(questionData.duration);
    }
  }, [questionData]);

  useEffect(() => {
    if (countdown === null) return;
  
    if (countdown <= 0) return;
  
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [countdown]);
  

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
      GamePlayPage
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <Box>
        {/* Rendering the question title */}
        <Typography variant="h5" gutterBottom>
          {questionData?.question ?? 'No question'}
        </Typography>
        {/* Rendering Score */}
        <Typography variant="body" gutterBottom>
        Score:{questionData?.points ?? 0} point
        </Typography>

        {/* rendering timer */}
        <Typography variant="body" gutterBottom>
        Timer:{questionData?.duration ?? 0} seconds
        </Typography>
        <Typography variant="body" gutterBottom color={countdown <= 3 ? 'error' : 'text.primary'}>
        ⏳{countdown} seconds
        </Typography>
      </Box>
    </Box>
  );
};

export default GamePlayPage;