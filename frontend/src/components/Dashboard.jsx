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
  const handleClose = () => setOpen(false);
  const [name, setName] = useState("");
  const [games, setGames] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const postNewGame = () => {
    const owner = localStorage.getItem(AUTH.USER_KEY);
    fetchAllGames()
      .then((data) => {
        const oldGame = Array.isArray(data.games) ? data.games : [];
        const newGame = {
          owner: owner,
          name: name,
          thumbnail:"",
          questions: [],
        };
        const newGameList = [...oldGame, newGame];
        return putNewGame(newGameList);
      })
      .then(()=> {
        handleClose();
        setName("");
        getGames();
        enqueueSnackbar("Game created successfully", { variant: "success" });
      })
      .catch((error) => {
        console.error("Error creating game:", error);
        enqueueSnackbar("Failed to create game", { variant: "error" });
      });
  }

  const getGames = () => {
    fetchAllGames()
      .then((data) => {
        setGames(data.games);
      })
  }

  useEffect(() => {
    getGames();
  }, [])

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
              sx={{width: "100%"}}
              required
              id="outlined-required"
              label="Game Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
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
              onClick={() => postNewGame(name)}
            >
              create
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
}
export default Dashboard;