import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';

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
          console.warn('Cannot fetch question, assuming game has ended. Navigating...');
          navigate(`/play/session/${sessionId}/player/${playerId}/result`);
          return;
        }
  
        const data = await res.json();
        const newQuestion = data.question;
  
        if (!newQuestion) {
          throw new Error('No question in response');
        }
  
        if (newQuestion.id !== questionId) {
          console.log('New question detected! Updating UI...');
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
        console.error('Polling error:', err.message || err);
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
    // const answers = options.map(index => questionData.optionAnswers[index]);
    const answers = options;
    const body = JSON.stringify({ answers });
  
    console.log('Submitting to:', `http://localhost:5005/play/${playerId}/answer`);
    console.log('Payload:', body);
  
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
        console.error('Server error text:', errorText);
        throw new Error('Failed to submit answer');
      }
  
      console.log('Answer submitted:', answers);
    } catch (err) {
      console.error('Submit error:', err);
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
      console.log('Question data from backend:', data);
  
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
      console.log('Raw response from /answer:', data);
  
      if (!Array.isArray(data.answers)) {
        throw new Error('Invalid answer format from server');
      }
  
      setCorrectAnswers(data.answers);
      setShowAnswer(true);
    } catch (err) {
      console.error('Failed to fetch correct answers:', err);
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
        <Typography variant="body" gutterBottom color={countdown <= 3 ? 'red' : 'text.primary'}>
        ⏳{countdown} seconds
        </Typography>
      </Box>
      {questionData?.media && (
        <Box sx={{ my: 2 }}>
          <iframe
            width="80%"
            height="500"
            src={transformMediaUrl(questionData.media)}
            title="Question Media"
            allowFullScreen
          />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {questionData?.optionAnswers?.map((option, index) => (
          <Button
            key={index}
            variant={
              selectedOptions.includes(index)
                ? 'contained'
                : showAnswer && correctAnswers.includes(index)
                  ? 'contained'
                  : 'outlined'
            }
            fullWidth
            color={
              selectedOptions.includes(index)
                ? 'primary'
                : showAnswer && correctAnswers.includes(index)
                  ? 'success'
                  : 'inherit'
            }
            onClick={() => handleOptionClick(index)}
            disabled={countdown === 0 || showAnswer}
          >
            {option}
          </Button>
        ))}
      </Box>

    </Box>
  );
};

export default GamePlayPage;