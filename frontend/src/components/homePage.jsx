import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

const Home = (props) => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate('/play');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

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
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {props.token === null
            ? 'What are you waiting for? Hurry up and join us!'
            : 'Welcome back, ready to start a new game?'}
        </Typography>
        {props.token === null ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleJoinClick}
            sx={{ minWidth: '200px' }}
          >
            Join a Game
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleDashboardClick}
            sx={{ minWidth: '200px' }}
          >
            Go to Dashboard
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Home;

