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

const SingleGame = () => {
    const { game_id } = useParams();
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [question, setQuestion] = useState([]);

    useEffect(() => {
        fetchAllGames()
        .then((data) => {
            const foundGame = data.games.find((game) => game.id === parseInt(game_id));
            if (foundGame) {
            setName(foundGame.name);
            setThumbnail(foundGame.thumbnail);
            }
        })
        .catch((error) => console.error("Error fetching games:", error));
    }, []);

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
            navigate("/dashboard");
            setName("");
            setThumbnail("");
        })
        .catch((error) => console.error("Error updating game:", error));
    };

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };


    return (
        <Container maxWidth="sm" sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
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
            <Typography variant="h5">Edit Game</Typography>
            <Tabs value={tab} onChange={handleTabChange} centered>
                <Tab label="Game Info" />
                <Tab label="Questions" />
            </Tabs>

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
                        <Button variant="outlined" sx={{ background: "red", color: "white" }} onClick={() => navigate("/dashboard")}>Cancel</Button>
                    </Box>
                </Box>
            )}

            {tab === 1 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Manage Questions</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpen}>
                        Add New Question
                    </Button>
                </Box>
            )}
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
                        label="Question"
                        onChange={(e) => setQuestion(e.target.value)}
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
