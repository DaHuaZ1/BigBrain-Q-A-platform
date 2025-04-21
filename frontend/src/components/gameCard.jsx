import { useState, useEffect } from "react";
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


const GameCard = (props) => {
  const games = props.games ?? [];
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetGameId, setTargetGameId] = useState(null);
  const [sessionDialog, setSessionDialog] = useState({ open: false, sessionId: null });
  const [stopDialog, setStopDialog] = useState({ open: false, game: null });
  const [resultDialog, setResultDialog] = useState({ open: false, game: null });
  const [animatedCards, setAnimatedCards] = useState({});
  const [detailDialog, setDetailDialog] = useState({ open: false, game: null, expand: false });

  useEffect(() => {
    games.forEach((game, index) => {
      setTimeout(() => {
        setAnimatedCards(prev => ({ ...prev, [game.id]: true }));
      }, index * 150 + 600);
    });
  }, [games]);

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
        setResultDialog({ open: true, game });
      }
    } catch (err) {
      enqueueSnackbar("Failed to stop session",err, { variant: "error" });
    }
  };

  const getAnimationStyle = (game, index) => {
    const animated = animatedCards[game.id];
  
    return {
      opacity: animated ? 1 : 0,
      transform: animated ? "none" : "translateY(-20px)",
      transition: "transform 0.3s, box-shadow 0.3s, opacity 0.6s ease",
      ...(animated ? {
        '&:hover': {
          transform: "scale(1.03)",
          boxShadow: 6,
        }
      } : {
        animation: `fadeSlideIn 0.6s ease forwards`,
        animationDelay: `${index * 0.15}s`,
        '@keyframes fadeSlideIn': {
          from: { opacity: 0, transform: 'translateY(-20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        }
      })
    };
  };  
  
  const getDifficultyStars = (game) => {
    const questions = game.questions;
    if (!questions || questions.length === 0) {
      return Array.from({ length: 6 }, (_, i) => (
        <StarIcon key={i} sx={{ color: '#e0e0e0', fontSize: 28, mx: 0.5 }} />
      ));
    }
  
    const qCount = questions.length;
    const totalTime = questions.reduce((sum, q) => sum + (q.duration || 0), 0);
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  
    const timePenalty = totalTime / 120;
    const pointBonus = totalPoints / 10;
  
    const rawScore = (qCount - timePenalty + pointBonus) / 2;
    const score = Math.max(1, Math.min(6, Math.ceil(rawScore)));
  
    return Array.from({ length: 6 }, (_, i) => (
      <StarIcon key={i} sx={{ color: i < score ? '#fbc02d' : '#e0e0e0', fontSize: 28, mx: 0.5 }} />
    ));
  };  

  return (
    <Grid container spacing={3}>
      {props.onAddGameClick && (
        <Grid key="add-new" size={{xs:12,sm:6,md:3}}>
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

      {games.map((game) => (
        <Grid key={game.id} size={{xs:12,sm:6,md:3}}>
          <Card
            onClick={(e) => {
              if (
                e.target.closest('button') || 
                e.target.closest('.MuiFab-root') || 
                e.target.closest('.MuiButtonBase-root')
              ) return;
              setDetailDialog({ open: true, game, expand: false });
            }}
            sx={{
              width: "100%",
              cursor: 'pointer',
              ...getAnimationStyle(game, games.indexOf(game)),
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

      <Dialog open={resultDialog.open} onClose={() => setResultDialog({ open: false, sessionId: null })}>
        <DialogTitle>Game Ended</DialogTitle>
        <DialogContent>
          <Typography>The game has ended. Would you like to view the results?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog({ open: false, sessionId: null })}>No</Button>
          <Button color="primary" onClick={() => {
            navigate(`/game/${resultDialog.game.id}/session/${resultDialog.game.active}`);
            setResultDialog({ open: false, sessionId: null });
          }}>Yes, show results</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, game: null, expand: false })}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 4,
            background: 'linear-gradient(to bottom, #f5f5f5, #ffffff)',
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '1.8rem',
          pt: 4,
          color: '#333',
          letterSpacing: 0.5,
        }}>
          {detailDialog.game?.name}
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 3 }}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#444', mb: 2, lineHeight: 1.6 }}>
            <strong>{detailDialog.game?.name}</strong> contains
            <strong> {detailDialog.game?.questions?.length ?? 0}</strong> questions with a total duration of
            <strong> {detailDialog.game?.questions?.reduce((sum, q) => sum + (q.duration || 0), 0)} seconds</strong>.
          </Typography>

          <Button
            variant="outlined"
            endIcon={detailDialog.expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setDetailDialog(prev => ({ ...prev, expand: !prev.expand }))}
            sx={{ mb: 2, textTransform: 'none', borderRadius: 3, fontWeight: 'medium' }}
            fullWidth
          >
            {detailDialog.expand ? 'Hide Question List' : 'Show All Questions'}
          </Button>

          {detailDialog.expand && (
            detailDialog.game?.questions?.length > 0 ? (
              detailDialog.game.questions.map((q, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 1.5,
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 3,
                    backgroundColor: '#fff8e1',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Q{i + 1}: {q?.question || "Untitled"}
                  </Typography>
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Duration: {q.duration || 0} seconds
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Type: {q.type || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Points: {q.points ?? "N/A"}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontStyle: 'italic',
                  textAlign: 'center',
                  color: '#999',
                  mt: 2,
                }}
              >
                The question list has not been set yet.
              </Typography>
            )
          )}

          <Box mt={4} textAlign="center">
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
              Difficulty Level
            </Typography>
            <Box display="flex" justifyContent="center">
              {detailDialog.game && getDifficultyStars(detailDialog.game)}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setDetailDialog({ open: false, game: null, expand: false })}
            variant="contained"
            sx={{ 
              borderRadius: 3, 
              px: 5, 
              backgroundColor: '#e20f43',
              transition: 'background-color 0.15s ease 0.1s, transform 0.15s ease 0.1s', 
              '&:hover': { 
                backgroundColor: '#2bcc1a',
                transform: "scale(1.11)" 
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default GameCard;