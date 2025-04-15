import React, { useState } from "react";
import Button from '@mui/material/Button';
import { Container, TextField } from "@mui/material";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import { fetchAllGames } from "../getAllGames";
import { putNewGame } from "../putNewGame";
import AUTH from "../Constant";

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
    const [title, setTitle] = useState("");

    const postNewGame = () => {
        const owner = localStorage.getItem(AUTH.USER_KEY);
        fetchAllGames()
        .then((data) => {
            console.log(data);
            const oldGame = Array.isArray(data.games) ? data.games : [];
            // create a new game object
            const newGame = {
                owner: owner,
                title: title,
                thumbnail:"",
                questions: [],
            };
            // add the new game object to the old game array
            const newGameList = [...oldGame, newGame];
            // update the game list in the database
            return putNewGame(newGameList);
        })
        .then((res)=> {
            handleClose();
            setTitle("");
        })
    }

    return (
        <>
            <Button 
                sx={{
                    margin: "10px",
                }} 
                variant="contained"
                onClick={handleOpen}    
            >
                Create a new game
            </Button>
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
                        <TextField
                            sx={{
                                width: "100%",
                            }}
                            required
                            id="outlined-required"
                            label="Game Title"
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                        />
                        <Button 
                            sx={{
                            marginTop: "20px",
                            width: "100%",
                            height: "50px",
                            fontSize: "20px",
                            fontWeight: "bold",
                            backgroundColor: "#000000",
                            color: "#FFFFFF",
                            "&:hover": {
                                backgroundColor: "#FFFFFF",
                                color: "#000000",
                            },
                            borderRadius: "8px",
                            border: "2px solid #000000",
                            }} 
                            variant="contained" 
                            onClick={() => postNewGame(title)}
                        >
                            submit
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}
export default Dashboard;