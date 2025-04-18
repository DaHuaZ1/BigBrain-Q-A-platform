import { useState } from "react";
import {
  Card, CardActions, CardContent, CardMedia, Button,
  Typography, Dialog, DialogActions, DialogTitle, Grid, Box,
  Tooltip, Fab, DialogContent, TextField
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import defImg from "../assets/default.jpg";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { fetchAllGames } from "../getAllGames";
import { putNewGame } from "../putNewGame";
import {MutateGameSession} from "../sessionAPI";

const GameCard = (props) => {
  const games = props.games ?? [];
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetGameId, setTargetGameId] = useState(null);
  const [sessionDialog, setSessionDialog] = useState({ open: false, sessionId: null });
  const [stopDialog, setStopDialog] = useState({ open: false, game: null });

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
        const newGameList = oldGame.filter(game => game.id !== gameId);
        return putNewGame(newGameList);
      })
      .then(() => {
        if (props.onDelete) props.onDelete();
        enqueueSnackbar("Game deleted successfully", { variant: "success" });
      })
      .catch((error) => {
        console.error("Error deleting game:", error);
        enqueueSnackbar("Failed to delete game", { variant: "error" });
      });
  };

  const handleStartSession = async (game) => {
    try {
      const result = await MutateGameSession(game.id, "START");
      if (result.data?.status === "started") {
        enqueueSnackbar("Game session started!", { variant: "success" });
        props.onDelete(); // reuse to trigger refresh
        setSessionDialog({ open: true, sessionId: result.data.sessionId ?? game.active });
      }
    } catch (err) {
      enqueueSnackbar("Failed to start session",err, { variant: "error" });
    }
  };

  const handleStopSession = async (game) => {
    try {
      const result = await MutateGameSession(game.id, "END");
      if (result.data?.status === "ended") {
        enqueueSnackbar("Game session ended", { variant: "info" });
        props.onDelete();
        navigate(`/game/${game.id}/session/${game.active}`);
      }
    } catch (err) {
      enqueueSnackbar("Failed to stop session",err, { variant: "error" });
    }
  };

  return (
    <Grid container spacing={3}>
      {games.map((game) => (
        <Grid key={game.id} size={{xs:12,sm:6,md:3}}>
          <Card
            sx={{
              width: "100%",
              transition: "transform 0.3s, box-shadow 0.3s",
              '&:hover': {
                transform: "scale(1.03)",
                boxShadow: 6,
              },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                alt="question pic"
                height="140"
                image={game.thumbnail || defImg}
              />
              {game.active ? (
                <>
                  <Tooltip title="Go to Session">
                    <Fab
                      color="secondary"
                      size="small"
                      onClick={() => navigate(`/game/${game.id}/session/${game.active}`)}
                      sx={{ position: "absolute", top: 8, right: 56, zIndex: 2, boxShadow: 3 }}
                    >
                      <DescriptionIcon />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Stop Session">
                    <Fab
                      color="error"
                      size="small"
                      onClick={() => setStopDialog({ open: true, game })}
                      sx={{ position: "absolute", top: 8, right: 8, zIndex: 2, boxShadow: 3 }}
                    >
                      <StopIcon />
                    </Fab>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title="Start Game">
                  <Fab
                    color="primary"
                    size="small"
                    onClick={() => handleStartSession(game)}
                    sx={{ position: "absolute", top: 8, right: 8, zIndex: 2, boxShadow: 3 }}
                  >
                    <PlayArrowIcon />
                  </Fab>
                </Tooltip>
              )}
            </Box>

            <CardContent>
              <Typography gutterBottom variant="h6" component="div" noWrap>
                {game.name}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span role="img" aria-label="brain">🧠</span>
                <Typography variant="body2" color="text.secondary">
                  {game.questions?.length ?? 0} Questions
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span role="img" aria-label="timer">⏱️</span>
                <Typography variant="body2" color="text.secondary">
                  {game.questions?.reduce((sum, q) => sum + (q.duration || 0), 0)} seconds total
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between" }}>
              <Button size="small" onClick={() => navigate(`/game/${game.id}`)}>Edit Game</Button>
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
              minHeight: 260,
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 40 }} />
            <Typography variant="subtitle1" mt={1}>Add New Game</Typography>
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

      <Dialog open={sessionDialog.open} onClose={() => setSessionDialog({ open: false })}>
        <DialogTitle>Session Started</DialogTitle>
        <DialogContent>
          <Typography>Session Link:</Typography>
          <TextField
            fullWidth
            value={`http://localhost:3000/play/session/${sessionDialog.sessionId}`}
            sx={{ mt: 2 }}
          />
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
              navigator.clipboard.writeText(`http://localhost:3000/play/session/${sessionDialog.sessionId}`);
              enqueueSnackbar("Link copied to clipboard", { variant: "info" });
            }}
          >
            Copy Link
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={stopDialog.open} onClose={() => setStopDialog({ open: false, game: null })}>
        <DialogTitle>Stop Game Session</DialogTitle>
        <DialogActions sx={{ justifyContent: "space-between", padding: "16px" }}>
          <Button onClick={() => setStopDialog({ open: false, game: null })}>Cancel</Button>
          <Button color="error" onClick={() => {
            handleStopSession(stopDialog.game);
            setStopDialog({ open: false, game: null });
          }}>
            Stop
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default GameCard;