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

/**
 * GameWaitAndPlayPage Component
 * Handles two main states of gameplay:
 * 1. Waiting room - displays when player joins but game hasn't started
 * 2. Active gameplay - shows questions and handles answer submission
 * Includes poll mechanisms to check game status and fetch questions
 */
const GameWaitAndPlayPage = () => {
  const navigate = useNavigate();
  const { playerId, sessionId } = useParams();
  
  // Game state management
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);

  // Question and answer related states
  const [questionData, setQuestionData] = useState(null);
  const [questionId, setQuestionId] = useState(null);
  const [error] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const questionType = questionData?.type;

  /**
   * Polls the backend to check if game has started
   * Continues polling until game starts or component unmounts
   */
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
        .catch(() => {
          // ignore errors here, we just want to keep polling
        })
        .finally(() => {
          setLoading(false);
        });
    };

    checkGameStatus();
    intervalId = setInterval(checkGameStatus, 1000);
    return () => clearInterval(intervalId);
  }, [playerId]);

  /**
   * Polls for new questions once game has started
   * Handles question transitions and stores question metadata in localStorage
   * Redirects to results page when game ends (no more questions)
   */
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

        // Handle new question received
        if (newQuestion.id !== questionId) {
          setQuestionData(newQuestion);
          setQuestionId(newQuestion.id);
          setCountdown(newQuestion.duration);
          setSelectedOptions([]);
          setCorrectAnswers([]);
          setShowAnswer(false);
          
          // Store question points and duration for score calculation
          const stored = JSON.parse(localStorage.getItem('questionPoints') || '{}');
          stored[newQuestion.id] = {
            points: newQuestion.points ?? 0,
            duration: newQuestion.duration ?? 0,
          };
          localStorage.setItem('questionPoints', JSON.stringify(stored));
        }
      } catch (_) {
        // Intentionally ignored: polling may fail due to timeout or network
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [gameStarted, playerId, questionId, sessionId, navigate]);

  /**
   * Sets countdown timer when a new question is loaded
   */
  useEffect(() => {
    if (questionData?.duration) {
      setCountdown(questionData.duration);
    }
  }, [questionData]);

  /**
   * Fetches correct answers when countdown reaches zero
   */
  useEffect(() => {
    if (countdown === 0 && !showAnswer) {
      fetchCorrectAnswers();
    }
  }, [countdown]);

  /**
   * Manages countdown timer for current question
   * Decrements timer every second until it reaches zero
   */
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

  /**
   * Transforms various YouTube URL formats to proper embed format
   * Handles YouTube Shorts, youtu.be links, and standard YouTube URLs
   * @param {string} url - The media URL to transform
   * @return {string} - Properly formatted embed URL
   */
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
    } catch (_) {
      // Ignore errors in URL parsing
    }
    return url;
  };

  /**
   * Submits player's answer to the backend
   * @param {Array} options - Array of selected answer indices
   */
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
        throw new Error('Failed to submit answer', errorText);
      }
    } catch (_) {
      // ignore errors in answer submission
    }
  };

  /**
   * Handles option selection based on question type
   * For single/judgement questions: allows only one selection
   * For multiple choice: allows multiple selections
   * @param {number} index - Index of the selected option
   */
  const handleOptionClick = (index) => {
    if (!questionType || countdown === 0) return;
    let newSelection = [];
    
    // Handle different question types
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

  /**
   * Fetches correct answers for the current question from backend
   * Called when question timer reaches zero
   */
  const fetchCorrectAnswers = async () => {
    try {
      const res = await fetch(`http://localhost:5005/play/${playerId}/answer`);
      const data = await res.json();
      setCorrectAnswers(data.answers);
      setShowAnswer(true);
    } catch (_) {
      // ignore errors in fetching correct answers
    }
  };

  if (loading) {
    return <div>Loading game status...</div>;
  }

  return (
    <div>
      {/* Game play interface - shown when game has started */}
      {gameStarted ? (
        <Container maxWidth="sm" sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            GamePlayPage
          </Typography>

          {/* Error display */}
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          {/* Question display section */}
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

              {/* Countdown timer - turns red when less than 3 seconds remain */}
              <Typography
                variant="h6"
                align="center"
                color={countdown <= 3 ? 'error' : 'text.primary'}
              >
                ⏳ {countdown} seconds
              </Typography>

              {/* Media display for URL type (YouTube videos, etc.) */}
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

              {/* Image display for uploaded images */}
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

              {/* Answer options - styling changes based on selection state and after showing answers */}
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
        // Waiting room - shown before game starts
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Waiting for the administrator to start the game...
          </Typography>

          <Typography variant="body1" sx={{ mt: 1 }}>
            Bored? try a quick game while you wait!
          </Typography>

          {/* Mini-game control buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={() => setActiveGame('snake')}>
              Try Snake
            </Button>
            <Button variant="outlined" onClick={() => setActiveGame(null)}>
              Stop Game
            </Button>
          </Box>

          {/* Snake mini-game container */}
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
