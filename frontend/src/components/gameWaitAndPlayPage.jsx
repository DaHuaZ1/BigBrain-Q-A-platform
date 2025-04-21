import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameSnake from './GameSnake';
import {
  Typography,
  Box,
  Button,
  Container,
  Stack,
} from '@mui/material';

const GameWaitAndPlayPage = () => {
  const navigate = useNavigate();
  const { playerId, sessionId } = useParams();
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);

  const [questionData, setQuestionData] = useState(null);
  const [questionId, setQuestionId] = useState(null);
  const [error] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const questionType = questionData?.type;

  useEffect(() => {
    let intervalId = null;
    const checkGameStatus = () => {
      fetch(`http://localhost:5005/play/${playerId}/status`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch status');
          return res.json();
        })
        .then((data) => {
          if (data.started) {
            setGameStarted(true);
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
    intervalId = setInterval(checkGameStatus, 1000);
    return () => clearInterval(intervalId);
  }, [playerId]);

  useEffect(() => {
    if (!gameStarted) return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5005/play/${playerId}/question`);
        if (!res.ok) {
          navigate(`/play/session/${sessionId}/player/${playerId}/result`);
          return;
        }
        const data = await res.json();
        const newQuestion = data.question;

        if (newQuestion.id !== questionId) {
          setQuestionData(newQuestion);
          setQuestionId(newQuestion.id);
          setCountdown(newQuestion.duration);
          setSelectedOptions([]);
          setCorrectAnswers([]);
          setShowAnswer(false);
          const stored = JSON.parse(localStorage.getItem('questionPoints') || '{}');
          stored[newQuestion.id] = {
            points: newQuestion.points ?? 0,
            duration: newQuestion.duration ?? 0,
          };
          localStorage.setItem('questionPoints', JSON.stringify(stored));
        }
      } catch (err) {
        console.error('error:', err.message || err);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [gameStarted, playerId, questionId, sessionId, navigate]);

  useEffect(() => {
    if (questionData?.duration) {
      setCountdown(questionData.duration);
    }
  }, [questionData]);

  useEffect(() => {
    if (countdown === 0 && !showAnswer) {
      fetchCorrectAnswers();
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
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

  const transformMediaUrl = (url) => {
    try {
      if (url.includes('youtube.com/shorts/')) {
        return url.replace('shorts/', 'embed/');
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch (err) {
      console.error("Invalid media URL", err);
    }
    return url;
  };

  const submitAnswer = async (options) => {
    const body = JSON.stringify({ answers: options });
    try {
      const response = await fetch(`http://localhost:5005/play/${playerId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('error:', errorText);
        throw new Error('Failed to submit answer');
      }
      console.log('Answer submitted:', options);
    } catch (err) {
      console.error('error:', err);
    }
  };

  const handleOptionClick = (index) => {
    if (!questionType || countdown === 0) return;
    let newSelection = [];
    if (questionType === 'single' || questionType === 'judgement') {
      newSelection = selectedOptions[0] === index ? [] : [index];
    } else if (questionType === 'multiple') {
      newSelection = selectedOptions.includes(index)
        ? selectedOptions.filter(i => i !== index)
        : [...selectedOptions, index];
    }
    setSelectedOptions(newSelection);
    submitAnswer(newSelection);
  };

  const fetchCorrectAnswers = async () => {
    try {
      const res = await fetch(`http://localhost:5005/play/${playerId}/answer`);
      const data = await res.json();
      setCorrectAnswers(data.answers);
      setShowAnswer(true);
    } catch (err) {
      console.error('Failed to fetch correct answers:', err);
    }
  };

  if (loading) {
    return <div>Loading game status...</div>;
  }

  return (
    <div>
      {gameStarted ? (
        <Container maxWidth="sm" sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            GamePlayPage
          </Typography>

          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          {questionData && (
            <Stack spacing={2} mt={2}>
              <Typography variant="h6" align="center">
                {questionData.question}
              </Typography>

              <Typography variant="body2" align="center">
                Score: {questionData.points ?? 0} point
              </Typography>

              <Typography variant="body2" align="center">
                Timer: {questionData.duration ?? 0} seconds
              </Typography>

              <Typography
                variant="h6"
                align="center"
                color={countdown <= 3 ? 'error' : 'text.primary'}
              >
                ⏳ {countdown} seconds
              </Typography>

              {questionData.mediaMode === 'url' && questionData.media && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <iframe
                    width="100%"
                    height="500"
                    src={transformMediaUrl(questionData.media)}
                    title="Question Media"
                    allowFullScreen
                  />
                </Box>
              )}

              {questionData.mediaMode === 'image' && questionData.imageData && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <img
                    src={questionData.imageData}
                    alt="Question"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                    }}
                  />
                </Box>
              )}

              <Stack spacing={1}>
                {questionData.optionAnswers.map((option, index) => (
                  <Button
                    key={index}
                    fullWidth
                    onClick={() => handleOptionClick(index)}
                    sx={{
                      whiteSpace: 'normal',
                      textAlign: 'left',
                      pointerEvents: countdown === 0 || showAnswer ? 'none' : 'auto',
                      opacity: 1,
                    }}
                    variant={
                      showAnswer
                        ? correctAnswers.includes(index)
                          ? 'contained'
                          : selectedOptions.includes(index)
                            ? 'contained'
                            : 'outlined'
                        : selectedOptions.includes(index)
                          ? 'contained'
                          : 'outlined'
                    }
                    color={
                      showAnswer
                        ? correctAnswers.includes(index)
                          ? 'success'
                          : selectedOptions.includes(index)
                            ? 'error'
                            : 'inherit'
                        : selectedOptions.includes(index)
                          ? 'primary'
                          : 'inherit'
                    }
                  >
                    {option}
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}
        </Container>
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

export default GameWaitAndPlayPage;
