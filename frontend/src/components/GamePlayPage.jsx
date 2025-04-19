import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';

const GamePlayPage = () => {
  const { playerId } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const questionType = questionData?.type; 


  const transformMediaUrl = (url) => {
    if (url.includes('youtube.com/shorts/')) {
      return url.replace('shorts/', 'embed/');
    }
    return url;
  };

  const handleOptionClick = (index) => {
    if (!questionType) return;
  
    if (questionType === 'single' || questionType === 'judgement') {
      setSelectedOptions(prev => prev[0] === index ? [] : [index]);
    } else if (questionType === 'multiple') {
      setSelectedOptions(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    }
  };
  
  

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
            variant={selectedOptions.includes(index) ? 'contained' : 'outlined'}
            fullWidth
            color={selectedOptions.includes(index) ? 'primary' : 'inherit'}
            onClick={() => handleOptionClick(index)}
            disabled={countdown === 0} // ⏳ 倒计时结束不能点
          >
            {option}
          </Button>
        ))}
      </Box>

    </Box>
  );
};

export default GamePlayPage;