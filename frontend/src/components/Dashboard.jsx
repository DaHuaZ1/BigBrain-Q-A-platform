import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import { Container, TextField, Typography } from "@mui/material";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import { fetchAllGames } from "../getAllGames";
import { putNewGame } from "../putNewGame";
import AUTH from "../Constant";
import GameCard from "./gameCard";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

/**
 * Style configuration for the create game modal
 * Centers the modal in the screen with proper styling
 */
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

/**
 * Dashboard Component
 * Main interface for managing and creating games
 * Provides functionality to view existing games, search games, and create new ones
 */
const Dashboard = () => {
  // Modal control state
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  
  /**
   * Handles closing the modal and resetting form state
   * Clears all form fields and parsed data when modal is closed
   */
  const handleClose = () => {
    setOpen(false);
    setName("");
    setUploadName("");
    setParsedQuestions([]);
    setParsedThumbnail("");
  };
  
  // Game management state variables
  const [name, setName] = useState(""); // Game name input
  const [games, setGames] = useState([]); // All games retrieved from backend
  const [uploadName, setUploadName] = useState(""); // Name of uploaded JSON file
  const [parsedQuestions, setParsedQuestions] = useState([]); // Questions from uploaded file
  const [parsedThumbnail, setParsedThumbnail] = useState(""); // Game thumbnail from file
  const { enqueueSnackbar } = useSnackbar(); // Notification system
  const [searchTerm, setSearchTerm] = useState(''); // Search functionality
  const navigate = useNavigate(); // Router navigation

  /**
   * Validates question objects from uploaded JSON
   * Ensures each question has the correct structure and data types
   * @param {Array} questions - Array of question objects to validate
   * @return {Boolean} - True if all questions are valid
   */
  const validateQuestions = (questions) => {
    return questions.every(q =>
      typeof q.question === 'string' &&
      Array.isArray(q.optionAnswers) &&
      Array.isArray(q.correctAnswers) &&
      typeof q.duration === 'number' &&
      typeof q.points === 'number' &&
      typeof q.type === 'string' &&
      typeof q.media === 'string' &&
      typeof q.mediaMode === 'string' &&
      typeof q.imageUploaded === 'boolean' &&
      typeof q.imageData === 'string'
    );
  };

  // Filter games based on search term for real-time search functionality
  const filteredGames = games.filter((game) =>
    game.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );  

  /**
   * Handles file upload and processing for game data
   * Validates JSON structure and extracts game information
   * Shows appropriate notifications for success or error states
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type is JSON
    if (!file.name.endsWith(".json")) {
      enqueueSnackbar("Only .json files are supported.", { variant: "warning" });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Parse and validate the JSON data
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data.questions) || !validateQuestions(data.questions)) {
          enqueueSnackbar("Invalid file structure.", { variant: "error" });
          return;
        }
        
        // Update state with parsed data
        setParsedQuestions(data.questions);
        if (data.name) setName(data.name);
        if (data.thumbnail) setParsedThumbnail(data.thumbnail);
        setUploadName(file.name);
        enqueueSnackbar("File uploaded and validated.", { variant: "success" });
      } catch (error) {
        enqueueSnackbar("Failed to parse JSON.", { variant: "error" }, error);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Creates a new game and saves it to the backend
   * Gets current games, adds new game to the list, and updates backend
   * Handles success and error notifications
   */
  const postNewGame = () => {
    const owner = localStorage.getItem(AUTH.USER_KEY);
    
    // Fetch existing games, then add the new one
    fetchAllGames()
      .then((data) => {
        const oldGame = Array.isArray(data.games) ? data.games : [];
        
        // Create the new game object
        const newGame = {
          owner: owner,
          name: name,
          thumbnail: parsedThumbnail || "",
          questions: parsedQuestions.length > 0 ? parsedQuestions : [],
        };
        
        const newGameList = [...oldGame, newGame];
        return putNewGame(newGameList);
      })
      .then(() => {
        // Handle success
        handleClose();
        getGames();
        enqueueSnackbar("Game created successfully", { variant: "success" });
      })
      .catch((error) => {
        // Handle error
        enqueueSnackbar("Failed to create game", { variant: "error" }, error);
      });
  };

  /**
   * Fetches all games from the backend API
   * Updates the games state with retrieved data
   */
  const getGames = () => {
    fetchAllGames()
      .then((data) => {
        setGames(data.games);
      });
  };

  // Fetch games on component mount
  useEffect(() => {
    getGames();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Dashboard header section: Title, Search bar, and History button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        
        {/* Search input with icon and styling */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Game by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: '9999px',
              backgroundColor: '#fff',
              paddingLeft: '8px',
            },
            '& input': {
              paddingLeft: 0,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        {/* Navigation button to game history */}
        <Button
          variant="contained"
          onClick={() => navigate('/game/history')}
          sx={{ height: "40px", fontWeight: "bold" }}
        >
          View Past Sessions
        </Button>
      </Box>
      
      {/* Game cards display area */}
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 4, backgroundColor: "#fafafa" }}>
        <GameCard games={filteredGames} onDelete={getGames} onAddGameClick={handleOpen} />
      </Box>

      {/* Modal for creating new games with animation effects */}
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
            {/* Modal title */}
            <Typography variant="h6" gutterBottom sx={{ 
              textAlign: "center", 
              fontWeight: "bold",
              marginBottom: "20px",
            }}>
              Create New Game
            </Typography>
            
            {/* Game name input field */}
            <TextField
              sx={{ width: "100%", mb: 2 }}
              required
              label="Game Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            
            {/* File upload button that triggers file input */}
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{ mb: 1 }}
            >
              Upload Game File (.json)
              <input type="file" accept=".json" hidden onChange={handleFileChange} />
            </Button>
            
            {/* Display uploaded filename */}
            {uploadName && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#888', mb: 1 }}>
                Uploaded: {uploadName}
              </Typography>
            )}
            
            {/* Submit button with hover effects */}
            <Button 
              sx={{
                mt: 1,
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
              onClick={postNewGame}
            >
              create
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default Dashboard;
