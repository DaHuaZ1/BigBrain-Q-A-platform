import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAllGames } from "../getAllGames";
import { putNewGame } from "../putNewGame";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";

// Modal styling
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// SingleGame component - handles editing of a single game's info and questions
const SingleGame = () => {
  const { game_id } = useParams(); // Get the game ID from the URL
  const [name, setName] = useState(""); // Game name state
  const [thumbnail, setThumbnail] = useState(""); // Game thumbnail state
  const [tab, setTab] = useState(0); // Current active tab (0: Game Info, 1: Questions)
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // Modal open state

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [questionTitle, setQuestionTitle] = useState([]); // New question title input
  const [questions, setQuestions] = useState([]); // Current game's questions
  const [game, setGame] = useState(null); // Full game object

  // Fetch and load game data on mount or when questions/game updates
  useEffect(() => {
    fetchAllGames()
      .then((data) => {
        const foundGame = data.games.find((game) => game.id === parseInt(game_id));
        if (foundGame) {
          setName(foundGame.name);
          setThumbnail(foundGame.thumbnail);
          setQuestions(foundGame.questions);
          setGame(foundGame);
        }
      })
      .catch((error) => console.error("Error fetching games:", error));
  }, [game, questions]); // Re-fetch when game or questions change

  // Update game info (name and thumbnail)
  const updateGame = () => {
    fetchAllGames()
      .then((data) => {
        const oldGames = data.games || [];
        const updatedGames = oldGames.map((game) =>
          game.id === parseInt(game_id) ? { ...game, name, thumbnail } : game
        );
        return putNewGame(updatedGames);
      })
      .then(() => {
        setName("");
        setThumbnail("");
      })
      .catch((error) => console.error("Error updating game:", error));
  };

  // Handle tab switching
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Add a new question to the current game
  const postNewQuestion = () => {
    fetchAllGames()
      .then((data) => {
        const oldGame = Array.isArray(data.games) ? data.games : [];
        const foundGame = oldGame.find((game) => game.id === parseInt(game_id));
        const existingQuestions = foundGame.questions || [];

        // Find next available question ID
        const maxId = existingQuestions.reduce((max, q) => Math.max(max, q.id || 0), 0);

        // Create new question object
        const newQuestion = {
          question: questionTitle,
          duration: 0,
          points: 0,
          type: "",
          optionAnswers: [],
          correctAnswers: [],
          media: "",
          id: maxId + 1,
        };

        // Append new question to existing ones
        const updatedQuestions = {
          ...foundGame,
          questions: [...existingQuestions, newQuestion]
        };

        // Replace old game with updated one
        const updatedGame = oldGame.map((game) =>
          game.id === parseInt(game_id) ? updatedQuestions : game
        );

        return putNewGame(updatedGame);
      })
      .then(() => {
        handleClose();
        setQuestionTitle("");
      })
  };

  // Show loading if game data is not ready yet
  if (!game) {
    return <div>Loading...</div>;
  }

  // Delete a question from the current game
  const deleteQuestion = (questionId) => {
    fetchAllGames()
      .then((data) => {
        const oldGame = data.games || [];
        const updatedGame = oldGame.map((game) => {
          if (game.id === parseInt(game_id)) {
            const updatedQuestions = game.questions.filter((question) => question.id !== questionId);
            return { ...game, questions: updatedQuestions };
          }
          return game;
        });
        return putNewGame(updatedGame);
      })
      .catch((error) => console.error("Error deleting question:", error));
  }

  return (
    <Container maxWidth="sm" sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Main card box */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 600,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5">Edit Game:{game.name}</Typography>
        
        {/* Tab navigation */}
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Game Info" />
          <Tab label="Questions" />
        </Tabs>

        {/* Game Info Tab */}
        {tab === 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Game Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Thumbnail (URL)"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" onClick={updateGame}>Save Changes</Button>
              <Button variant="contained" color="error" onClick={() => navigate("/dashboard")}>back</Button>
            </Box>
          </Box>
        )}

        {/* Questions Tab */}
        {tab === 1 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* List of existing questions */}
              {questions.map((question) => (
                <React.Fragment key={question.id}>
                  <Typography variant="h6">Question: {question.id}</Typography>
                  <Box sx={{ display:"flex", justifyContent:"space-between" , border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                    <Typography variant="body1">{question.question}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" size="small" onClick={()=>navigate(`/game/${game.id}/question/${question.id}`)}>Edit</Button>
                      <Button variant="contained" size="small" color="error" onClick={()=>deleteQuestion(question.id)}>Delete</Button>
                    </Box>
                  </Box>
                </React.Fragment>
              ))}
            </Box>

            {/* Message for empty question list */}
            {questions.length === 0 && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                No questions available. Please add a question.
              </Typography>
            )}

            {/* Buttons for adding question and navigating back */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="contained" onClick={handleOpen}>
                Add New Question
              </Button>
              <Button variant="contained" color="error" onClick={() => navigate("/dashboard")}>back</Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Modal for adding new question */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography variant="h6" gutterBottom sx={{ 
              textAlign: "center", 
              fontWeight: "bold",
              marginBottom: "20px",
            }}>
              Add New Question
            </Typography>
            <TextField
              sx={{width: "100%"}}
              required
              id="outlined-required"
              label="Question Title"
              onChange={(e) => setQuestionTitle(e.target.value)}
              value={questionTitle}
            />
            <Button 
              sx={{
                marginTop: "20px",
                width: "100%",
                height: "50px",
                fontSize: "18px",
                fontWeight: "bold",
                backgroundColor: "#000000",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                },
                borderRadius: "8px",
                border: "2px solid #000000",
                transition: "all 0.3s ease",
              }} 
              variant="contained" 
              onClick={postNewQuestion}
            >
              submit
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default SingleGame;
