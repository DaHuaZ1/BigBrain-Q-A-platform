import React, { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from "react-router-dom";

const GameCard = (props) => {
    const games = props.games ?? [];
    const navigate = useNavigate();

    const goToSingleGame = (gameId) => {
        navigate(`/game/${gameId}`);
    }

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px"}}>
            {games.map((game)=>(
                <Card  key={game.id} sx={{ marginLeft: "10px", width: 300}}>
                    <CardMedia
                        component="img"
                        alt="question pic"
                        height="140"
                        image={game.thumbnail || "/static/images/cards/default.jpg"}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {game.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            info
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ display: "flex", justifyContent: "space-between"}}>
                        <Button size="small" onClick={()=>goToSingleGame(game.id)}>Edit Game</Button>
                        <Button size="small">Delete</Button>
                    </CardActions>
                </Card>
            ))}
        </div>
        
    );
}

export default GameCard;