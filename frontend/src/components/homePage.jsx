import React from 'react';
import Button from '@mui/material/Button';
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
    <>
      {props.token ===null
        ?<>
          <p>
          What are you waiting for? Hurry up and join us!
          </p>
          <Button variant="contained" color="primary" onClick={handleJoinClick}>
            Join a Game
          </Button>
        </>

        :<>
          <p>
          Welcome back, ready to start a new game?
          </p>
          <Button variant="contained" color="primary" onClick={handleDashboardClick}>
            Go to Dashboard
          </Button>
        </>}
    </>
  )
}

export default Home;
