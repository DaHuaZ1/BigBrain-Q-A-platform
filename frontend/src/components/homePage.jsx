import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';

const tips = [
  "💡 Tip: Speed earns more points!",
  "🎯 Did you know? Correct streaks multiply your score.",
  "🕹️ Pro tip: You can replay any game from the dashboard.",
  "🔒 Don't refresh during a game session!",
  "🔥 Fun fact: You can hover over questions to see time left."
];

const particlesOptions = (theme = 'light') => ({
  background: {
    color: {
      value: theme === 'dark' ? '#0d1b2a' : '#f5f7fa'
    }
  },
  particles: {
    number: {
      value: 50,
    },
    color: {
      value: theme === 'dark' ? '#ffffff' : '#000000'
    },
    shape: {
      type: 'circle'
    },
    opacity: {
      value: 0.5
    },
    size: {
      value: { min: 1, max: 5 }
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'none',
      outMode: 'bounce'
    }
  },
  detectRetina: true
});

const MouseTrail = () => {
  useEffect(() => {
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = '9999';
    trail.style.width = '10px';
    trail.style.height = '10px';
    trail.style.borderRadius = '50%';
    trail.style.background = 'radial-gradient(circle, #ffffff88 0%, transparent 70%)';
    document.body.appendChild(trail);

    const moveTrail = (e) => {
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', moveTrail);
    return () => window.removeEventListener('mousemove', moveTrail);
  }, []);
  return null;
};

const Home = (props) => {
  const navigate = useNavigate();
  const [tip, setTip] = useState(localStorage.getItem('tip') || '');
  const [greeting, setGreeting] = useState(localStorage.getItem('greeting') || '');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (!greeting || !tip) {
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good Morning, Commander!' :
        hour < 18 ? 'Good Afternoon, Commander!' :
          'Good Evening, Commander!';
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      localStorage.setItem('greeting', greet);
      localStorage.setItem('tip', randomTip);
      setGreeting(greet);
      setTip(randomTip);
    }

    setTheme((() => {
      const hour = new Date().getHours();
      return (hour >= 19 || hour < 6) ? 'dark' : 'light';
    })());
  }, []);

  const handleJoinClick = () => navigate('/play');
  const handleDashboardClick = () => navigate('/dashboard');

  return (
    <Container
      maxWidth="sm"
      sx={{
        minWidth: '400px',
        minHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        padding: 3,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background layer with z-index -1 */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <Particles options={particlesOptions(theme)} />
        <MouseTrail />
      </Box>

      {/* Foreground content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ zIndex: 1, position: 'relative' }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          {greeting}
        </Typography>

        <Typography variant="h6" sx={{ mb: 3 }}>
          {props.token === null
            ? 'What are you waiting for? Hurry up and join us!'
            : 'Welcome back, ready to start a new game?'}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={props.token === null ? handleJoinClick : handleDashboardClick}
          sx={{
            minWidth: '200px',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'scale(1.08)',
              boxShadow: '0 0 12px 4px rgba(0, 123, 255, 0.5)'
            }
          }}
        >
          {props.token === null ? 'Join a Game' : 'Go to Dashboard'}
        </Button>

        <Typography variant="body2" sx={{ mt: 4, fontStyle: 'italic', color: 'gray' }}>
          {tip}
        </Typography>
      </motion.div>
    </Container>
  );
};

export default Home;