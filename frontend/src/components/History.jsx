import { useEffect, useState } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchAllGames } from "../getAllGames";
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';

const History = () => {
  const [games, setGames] = useState([]);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllGames().then((data) => setGames(data.games || []));
  }, []);

  const toggleExpand = (gameId) => {
    setExpanded((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Past Game Sessions
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
      {games.map((game) => (
        <Box key={game.id} sx={{ mb: 4, border: '1px solid #ccc', borderRadius: 2, p: 2 }}> 
          <Typography variant="h6" fontWeight="bold">
            {game.name || `Untitled Game (${game.id})`}
          </Typography>
          <Box
            onClick={() => toggleExpand(game.id)}
            sx={{
              mt: 1,
              cursor: "pointer",
              px: 1,
              display: 'flex',
              alignItems: 'center',
              color: "#666",
              fontFamily: 'monospace',
              userSelect: 'none'
            }}
          >
            {expanded[game.id] ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {expanded[game.id] ? "Hide Sessions" : "Show Sessions"}
            </Typography>
          </Box>
          {expanded[game.id] && (
            <Box sx={{ mt: 2 }}>
              {game.oldSessions?.length > 0 ? (
                game.oldSessions.map((sessionId, index) => (
                  <Box key={sessionId} sx={{
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9',
                    opacity: 0,
                    transform: 'translateX(-20px)',
                    animation: `fadeSlideIn 0.6s ease forwards`,
                    animationDelay: `${index * 0.15}s`,
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Session ID: {sessionId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This session has ended and results are available.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/game/${game.id}/session/${sessionId}`)}
                    >
                      View
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", color: "#999", mt: 1 }}
                >
                  No session records available.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      ))}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Container>
  );
};

export default History;
