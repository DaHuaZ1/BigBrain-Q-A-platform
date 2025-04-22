import { useEffect, useState } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchAllGames } from "../getAllGames";
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';

const History = () => {
  // State to hold all game records
  const [games, setGames] = useState([]);

  // State to track which game's session list is expanded
  const [expanded, setExpanded] = useState({});

  // Navigation hook from react-router-dom
  const navigate = useNavigate();

  // Fetch game records when component mounts
  useEffect(() => {
    fetchAllGames().then((data) => setGames(data.games || []));
  }, []);

  // Toggle session list expansion for a specific game
  const toggleExpand = (gameId) => {
    setExpanded((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Header with title and back button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Past Game Sessions
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      {/* Show message if no games are found */}
      {games.length === 0 && (
        <Typography
          variant="body1"
          sx={{ textAlign: 'center', color: '#999', fontStyle: 'italic', mt: 6 }}
        >
          No session records available.
        </Typography>
      )}

      {/* Render game list */}
      {games.map((game) => (
        <Box key={game.id} sx={{ mb: 4, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
          {/* Game title */}
          <Typography variant="h6" fontWeight="bold">
            {game.name || `Untitled Game (${game.id})`}
          </Typography>

          {/* Expand/Collapse toggle */}
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

          {/* Session list (only if expanded) */}
          {expanded[game.id] && (
            <Box sx={{ mt: 2 }}>
              {/* If old sessions exist, display them with animation */}
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
                    animationDelay: `${index * 0.15}s`, // Stagger animation
                  }}>
                    {/* Session info */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Session ID: {sessionId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This session has ended and results are available.
                      </Typography>
                    </Box>
                    {/* Button to view session details */}
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/game/${game.id}/session/${sessionId}`)}
                    >
                      View
                    </Button>
                  </Box>
                ))
              ) : (
                // Message if no old sessions are available
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

      {/* Define CSS keyframes for fade-in animation with slide effect */}
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
