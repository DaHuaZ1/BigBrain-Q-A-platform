import React, { useState } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from "react-router-dom";
import defImg from "../assets/default.jpg";
import { fetchAllGames } from "../getAllGames";
import { putNewGame } from "../putNewGame";
import { useSnackbar } from "notistack";
import Grid from '@mui/material/Grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const GameCard = (props) => {
    const games = props.games ?? [];
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const goToSingleGame = (gameId) => {
        navigate(`/game/${gameId}`);
    }

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [targetGameId, setTargetGameId] = useState(null);

    const openConfirmDialog = (gameId) => {
        setTargetGameId(gameId);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        setConfirmOpen(false);
        deleteGame(targetGameId);
    };

    const deleteGame = (gameId) => {
        fetchAllGames()
        .then((data) => {
            const oldGame = Array.isArray(data.games) ? data.games : [];
            // filter out the game with the given id
            const newGameList = oldGame.filter(game => game.id !== gameId);
            // update the game list in the database
            return putNewGame(newGameList);
        })
        .then(()=> {
            if (props.onDelete) props.onDelete();
            enqueueSnackbar("Game deleted successfully", { variant: "success" });
        })
        .catch((error) => {
            console.error("Error deleting game:", error);
            enqueueSnackbar("Failed to delete game", { variant: "error" });
        });
    }

    return (
        <Grid container spacing={3}>
            {games.map((game)=>(
                <Grid size={{xs:12,sm:6,md:3}} key={game.id}>
                    <Card sx={{ 
                            width:"100%",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            '&:hover': {
                                transform: "scale(1.03)",
                                boxShadow: 6
                            },
                        }}>
                        <CardMedia
                            component="img"
                            alt="question pic"
                            height="140"
                            image={game.thumbnail || defImg}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h6" component="div" noWrap>
                                {game.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                info
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ display: "flex", justifyContent: "space-between"}}>
                            <Button size="small" onClick={()=>goToSingleGame(game.id)}>Edit Game</Button>
                            <Button size="small" color="error" onClick={() => openConfirmDialog(game.id)}>Delete</Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}

            {props.onAddGameClick && (
                <Grid size={{xs:12,sm:6,md:3}}>
                    <Card
                        onClick={props.onAddGameClick}
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            color: "#aaa",
                            border: "2px dashed #ccc",
                            transition: "all 0.3s ease",
                            '&:hover': {
                                borderColor: "#000",
                                color: "#000",
                                transform: "scale(1.03)",
                                boxShadow: 3,
                            },
                            minHeight: 260
                        }}
                    >
                        <AddCircleOutlineIcon sx={{ fontSize: 40 }} />
                        <Typography variant="subtitle1" mt={1}>
                            Add New Game
                        </Typography>
                    </Card>
                </Grid>
            )}

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Are you sure you want to delete this game?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error">Confirm</Button>
                </DialogActions>
            </Dialog>
        </Grid>
        
    );
};

export default GameCard;