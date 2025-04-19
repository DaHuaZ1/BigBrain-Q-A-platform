import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';
import { Container, Stack } from '@mui/material';

const GamePlayPage = () => {
  const { playerId, sessionId } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [questionId, setQuestionId] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const questionType = questionData?.type; 
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
          stored[newQuestion.id] = newQuestion.points ?? 0;
          localStorage.setItem('questionPoints', JSON.stringify(stored));
        }
      } catch (err) {
        console.error('error:', err.message || err);
      }
    }, 1000);
  
    return () => clearInterval(pollInterval);
  }, [playerId, questionId, sessionId, navigate]);
  
  


  const transformMediaUrl = (url) => {
    if (url.includes('youtube.com/shorts/')) {
      return url.replace('shorts/', 'embed/');
    }
    return url;
  };

  const submitAnswer = async (options) => {
    const answers = options;
    const body = JSON.stringify({ answers });
  
    try {
      const response = await fetch(`http://localhost:5005/play/${playerId}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('error:', errorText);
        throw new Error('Failed to submit answer');
      }
  
      console.log('Answer submitted:', answers);
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

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`http://localhost:5005/play/${playerId}/question`);
      const data = await res.json();
  
      const q = data.question;
      setQuestionData(q);
      setQuestionId(q.id);
  
      const stored = JSON.parse(localStorage.getItem('questionPoints') || '{}');
      if (!(q.id in stored)) {
        stored[q.id] = q.points ?? 0;
        localStorage.setItem('questionPoints', JSON.stringify(stored));
      }
  
    } catch (err) {
      console.error(err);
      setError('Failed to load question');
    }
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
  
  useEffect(() => {
    fetchQuestion();
  }, []);

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

          {questionData.media && (
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
                  opacity: 1
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

  );
};

export default GamePlayPage;