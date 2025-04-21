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

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setUploadName("");
    setParsedQuestions([]);
    setParsedThumbnail("");
  };
  const [name, setName] = useState("");
  const [games, setGames] = useState([]);
  const [uploadName, setUploadName] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parsedThumbnail, setParsedThumbnail] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      enqueueSnackbar("Only .json files are supported.", { variant: "warning" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data.questions) || !validateQuestions(data.questions)) {
          enqueueSnackbar("Invalid file structure.", { variant: "error" });
          return;
        }
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

  const postNewGame = () => {
    const owner = localStorage.getItem(AUTH.USER_KEY);
    fetchAllGames()
      .then((data) => {
        const oldGame = Array.isArray(data.games) ? data.games : [];
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
        handleClose();
        getGames();
        enqueueSnackbar("Game created successfully", { variant: "success" });
      })
      .catch((error) => {
        console.error("Error creating game:", error);
        enqueueSnackbar("Failed to create game", { variant: "error" });
      });
  };

  const getGames = () => {
    fetchAllGames()
      .then((data) => {
        setGames(data.games);
      });
  };

  useEffect(() => {
    getGames();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/game/history')}
          sx={{ height: "40px", fontWeight: "bold" }}
        >
          View Past Sessions
        </Button>
      </Box>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 4, backgroundColor: "#fafafa" }}>
        <GameCard games={games} onDelete={getGames} onAddGameClick={handleOpen} />
      </Box>

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
              Create New Game
            </Typography>
            <TextField
              sx={{ width: "100%", mb: 2 }}
              required
              label="Game Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{ mb: 1 }}
            >
              Upload Game File (.json)
              <input type="file" accept=".json" hidden onChange={handleFileChange} />
            </Button>
            {uploadName && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#888', mb: 1 }}>
                Uploaded: {uploadName}
              </Typography>
            )}
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
