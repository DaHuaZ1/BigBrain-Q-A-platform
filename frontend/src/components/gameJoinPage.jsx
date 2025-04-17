//import
import { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material'; 
import { useParams } from 'react-router-dom';

//Main
const GameJoinPage = () => {
  //read sessionId from route
  const { sessionId: routeSessionId } = useParams();

  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');

  //SessionId judgment
  useEffect(() => {
    if (routeSessionId) {
      setSessionId(routeSessionId);
    }
  }, [routeSessionId]);

  const handleStartGame = () => {
    console.log('Session ID:', sessionId);
    console.log('Name:', name);
    // Waiting for 2.4.2
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
      <Typography variant="h5">Join a Game Session</Typography>

      {/* Disable Session ID input (if there is a Session ID from the route) */}
      <TextField
        label="Session ID"
        variant="outlined"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        fullWidth
        disabled={!!routeSessionId}
      />

      <TextField
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
  );
};


export default GameJoinPage;