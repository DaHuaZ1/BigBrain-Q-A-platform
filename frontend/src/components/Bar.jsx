// React and MUI imports
import { useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import HowToRegIcon from '@mui/icons-material/HowToReg';

// Eye component: renders a single animated eye that follows the mouse
const Eye = () => {
  const pupilRef = useRef(null);
  const eyeContainerRef = useRef(null);

  // Handle pupil movement based on mouse position
  useEffect(() => {
    const movePupil = (e) => {
      const eye = eyeContainerRef.current;
      const pupil = pupilRef.current;
      if (!eye || !pupil) return;

      const rect = eye.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const angle = Math.atan2(dy, dx);
      const maxDistance = 10;

      // Move the pupil within a circular boundary
      const x = maxDistance * Math.cos(angle);
      const y = maxDistance * Math.sin(angle);

      pupil.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', movePupil);
    return () => window.removeEventListener('mousemove', movePupil);
  }, []);

  return (
    // Render eye (white circle) with a black pupil that follows the mouse
    <Box
      ref={eyeContainerRef}
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        backgroundColor: 'white',
        border: '2px solid black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 0.5,
      }}
    >
      <Box
        ref={pupilRef}
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'black',
        }}
      />
    </Box>
  );
};

// Bar component: renders the top navigation bar with eyes, logo, and login/logout logic
const Bar = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Use hour to determine theme
  const hour = new Date().getHours();
  const theme = (hour >= 19 || hour < 6) ? 'dark' : 'light';

  const logout = () => {
    props.setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('questionPoints');
    localStorage.removeItem('tip');
    localStorage.removeItem('greeting');
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: isHome
            ? (theme === 'dark' ? '#0d1b2a' : '#f5f7fa')
            : undefined,
          color: isHome
            ? (theme === 'dark' ? '#ffffff' : '#000000')
            : undefined,
          boxShadow: isHome ? 'none' : undefined,
        }}
      >
        <Toolbar>
          {/* Render two animated eyes */}
          <Box sx={{ display: 'flex', mr: 2 }}>
            <Eye />
            <Eye />
          </Box>

          {/* App title with custom font and text shadow */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontFamily: "'Pacifico', cursive",
              fontWeight: 'bold',
              textShadow: isHome ? 'none' : '2px 2px 4px #000000',
              letterSpacing: 1,
            }}
          >
            bigbrain
          </Typography>
          
          {/* Render login/signup if not authenticated; otherwise show logout switch */}
          {props.token === null ? (
            <>
              <Tooltip title="Login">
                <IconButton color="inherit" component={Link} to="/login">
                  <MeetingRoomIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Signup">
                <IconButton color="inherit" component={Link} to="/signup">
                  <HowToRegIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Logout</Typography>
              <Switch
                color="warning"
                onChange={logout}
                icon={<LogoutIcon />}
                checkedIcon={<LogoutIcon />}
              />
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Bar;
