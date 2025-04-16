import React, { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from "react-router-dom";
import defImg from "../images/default.jpg";
import { fetchAllGames } from "../getAllGames";
import { putNewGame } from "../putNewGame";

const GameCard = (props) => {
    const games = props.games ?? [];
    const navigate = useNavigate();

    const goToSingleGame = (gameId) => {
        navigate(`/game/${gameId}`);
    }

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
        })
        .catch((error) => console.error("Error deleting game:", error));
    }

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px"}}>
            {games.map((game)=>(
                <Card  key={game.id} sx={{ marginLeft: "10px", width: 300}}>
                    <CardMedia
                        component="img"
                        alt="question pic"
                        height="140"
                        image={game.thumbnail || defImg}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {game.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            info
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ display: "flex", justifyContent: "space-between"}}>
                        <Button size="small" onClick={()=>goToSingleGame(game.id)}>Edit Game</Button>
                        <Button size="small" onClick={()=>deleteGame(game.id)} >Delete</Button>
                    </CardActions>
                </Card>
            ))}
        </div>
        
    );
}

export default GameCard;