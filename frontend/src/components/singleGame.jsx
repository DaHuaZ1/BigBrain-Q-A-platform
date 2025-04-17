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

const SingleGame = () => {
  const { game_id } = useParams();
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
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
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => console.log("Add Question")}>
              Add New Question
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SingleGame;
