import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { fetchAllGames } from "../getAllGames";
import { putNewGame } from "../putNewGame";
import { useNavigate } from "react-router-dom";

const SingleGame = () => {
    const { game_id } = useParams();
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [games, setGames] = useState(null);
    const navigate = useNavigate();

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
    },[]);

    const updateGame = () => {
        fetchAllGames()
            .then((data) => {
                const oldGames = data.games || [];
                const updatedGames = oldGames.map(game => 
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
    }

    return (
        <Container maxWidth="sm" sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Box
              component="form"
              sx={{
                width: '100%',
                maxWidth: { xs: 360, sm: 500, md: 800 },
                mx: 'auto',
                p: { xs: 2, sm: 3 },
                boxShadow: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: 'background.paper',
                minHeight: 'auto',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Edit Game
              </Typography>

              <TextField
                label="Game Name"
                id="outlined-required"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <TextField
                label="Thumbnail(URL)"
                id="outlined-required"
                onChange={(e) => setThumbnail(e.target.value)}
                value={thumbnail}
              />
              <Button variant="contained" onClick={updateGame}>
                Save Changes
              </Button>
            </Box>
          </Container>
    );
}

export default SingleGame;