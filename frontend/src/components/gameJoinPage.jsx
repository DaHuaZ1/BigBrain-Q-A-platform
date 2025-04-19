//import
import { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material'; 
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';


//Main
const GameJoinPage = () => {
  const navigate = useNavigate();
  //read sessionId from route
  const { sessionId: routeSessionId } = useParams();

  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');

  //SessionId judgment
  useEffect(() => {
    if (routeSessionId) {
      setSessionId(routeSessionId);
    }
  }, [routeSessionId]);

  const handleStartGame = () => {
    if (!name.trim() && !sessionId.trim()) {
      setError('Please enter your name and session ID.');
    } else if (!name.trim()) {
      setError('Please enter your name.');
    } else if (!sessionId.trim()) {
      setError('Session ID is required.');
    } else {
      setError('');
      console.log('Session ID:', sessionId);
      console.log('Name:', name);
      // Jump to gamePlagPage
      fetch(`http://localhost:5005/play/join/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to join the session.');
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log('Join API response:', data);
          const playerId = data.playerId;
          navigate(`/play/session/${sessionId}/player/${playerId}/wait`);
        })
        
    }
  };

  return (
    <>
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
        <Typography variant="h5">Join a Game Session</Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Disable Session ID input (if there is a Session ID from the route) */}
        <TextField
          required
          label="Session ID"
          variant="outlined"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          fullWidth
          disabled={!!routeSessionId}
        />

        <TextField
          required
          label="Your Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleStartGame}
          sx={{ minWidth: '200px' }}
        >
        Start Game
        </Button>
      </Container>
    </>
    
  );
};


export default GameJoinPage;