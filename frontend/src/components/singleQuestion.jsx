import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAllGames } from "../getAllGames";
import {
  Container, Typography, Box, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Checkbox, IconButton, Paper, Divider
} from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import { putNewGame } from "../putNewGame";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} variant="filled" ref={ref} {...props} />;
});

const SingleQuestion = () => {
  const { game_id, question_id } = useParams();
  const [question, setQuestion] = useState(null);
  const [game, setGame] = useState(null);
  const navigate = useNavigate();
  const questionRef = useRef();
  const typeRef = useRef();
  const durationRef = useRef();
  const pointsRef = useRef();
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });


  useEffect(() => {
    fetchAllGames().then((data) => {
      const foundGame = data.games.find((game) => game.id === parseInt(game_id));
      if (foundGame) {
        setGame(foundGame);
        const foundQuestion = foundGame.questions.find((question) => question.id === parseInt(question_id));
        if (foundQuestion) {
          const options = foundQuestion.optionAnswers.length >= 2 ? foundQuestion.optionAnswers : ["", ""];
          setQuestion({ ...foundQuestion, optionAnswers: options });
        }
      }
    });
  }, []);

  const handleReset = () => {
    setQuestion({
      ...question,
      question: "",
      type: "",
      duration: 0,
      points: 0,
      media: "",
      optionAnswers: ["", ""],
      correctAnswers: [],
    });
    setSnackbar({ open: true, message: "Reset Form", severity: "info" });
  };  

  const saveQuestion = () => {
    // Validate required fields and auto-focus first invalid one
    if (!question.question.trim()) {
      questionRef.current.focus();
      return;
    }
    if (!question.type) {
      typeRef.current.focus();
      return;
    }
    if (question.duration < 0 || isNaN(question.duration)) {
      durationRef.current.focus();
      return;
    }
    if (question.points < 0 || isNaN(question.points)) {
      pointsRef.current.focus();
      return;
    }

    const updatedQuestion = {
      ...question,
      duration: Math.max(0, question.duration),
      points: Math.max(0, question.points),
    };
    const updatedQuestions = game.questions.map((q) => (q.id === question.id ? updatedQuestion : q));
    const updatedGame = { ...game, questions: updatedQuestions };
    putNewGame([updatedGame])
      .then(() => {
        setGame(updatedGame);
        setQuestion(updatedQuestion);
        console.log("Question updated successfully");
        setSnackbar({ open: true, message: "Question updated successfully", severity: "success" });
      })
      .catch((error) => console.error("Error updating question:", error));
  };

  if (!question) return <div>Loading...</div>;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {game.name} - Edit Question #{question.id}
          </Typography>
          <IconButton
            onClick={()=> setOpenResetDialog(true)}
            title="Reset Form"
            sx={{ color: "#888" }}
          >
            <RestartAltIcon />
          </IconButton>
        </Box>


        <Divider sx={{ my: 3 }} />

        <Box 
          component="form" 
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          onSubmit={e => {
            e.preventDefault();
            saveQuestion();
          }}
        >
          <TextField
            label="Question Text"
            value={question.question}
            onChange={(e) => setQuestion({ ...question, question: e.target.value })}
            fullWidth required inputRef={questionRef}
          />

          <FormControl fullWidth required>
            <InputLabel id="type-label">Question Type</InputLabel>
            <Select
              labelId="type-label"
              value={question.type}
              onChange={(e) => {
                let newCorrect = question.correctAnswers;
                if (e.target.value === "single" || e.target.value === "judgement") {
                  newCorrect = question.correctAnswers.length > 0 ? [question.correctAnswers[0]] : [];
                }
                setQuestion({ ...question, type: e.target.value, correctAnswers: newCorrect });
              }}
              label="Question Type"
              inputRef={typeRef}
            >
              <MenuItem value="single">Single Choice</MenuItem>
              <MenuItem value="multiple">Multiple Choice</MenuItem>
              <MenuItem value="judgement">Judgement</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" gap={2}>
            <TextField
              label="Time Limit (s)"
              type="number"
              value={question.duration || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setQuestion({ ...question, duration: isNaN(val) ? 0 : Math.max(0, val) });
              }}
              fullWidth inputRef={durationRef}
              required
            />
            <TextField
              label="Points"
              type="number"
              value={question.points || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setQuestion({ ...question, points: isNaN(val) ? 0 : Math.max(0, val) });
              }}
              fullWidth inputRef={pointsRef}
              required
            />
          </Box>

          <TextField
            label="YouTube URL (optional)"
            value={question.media}
            onChange={(e) => setQuestion({ ...question, media: e.target.value })}
            fullWidth
          />

          <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>Answer Options</Typography>
          {question.optionAnswers.map((answer, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Checkbox
                checked={question.correctAnswers.includes(index)}
                onChange={(e) => {
                  let newCorrect;
                  if (e.target.checked) {
                    if (question.type === "single" || question.type === "judgement") {
                      newCorrect = [index];
                    } else {
                      newCorrect = [...question.correctAnswers, index];
                    }
                  } else {
                    newCorrect = question.correctAnswers.filter(i => i !== index);
                  }
                  setQuestion({ ...question, correctAnswers: newCorrect });
                }}
                required={question.type === "multiple" ? question.correctAnswers.length < 2 : question.correctAnswers.length === 0}
              />
              <TextField
                label={`Answer ${index + 1}`}
                value={answer}
                onChange={(e) => {
                  const newOptions = [...question.optionAnswers];
                  newOptions[index] = e.target.value;
                  setQuestion({ ...question, optionAnswers: newOptions });
                }}
                fullWidth
                required
              />
              <IconButton
                disabled={question.optionAnswers.length <= 2}
                onClick={() => {
                  const newOptions = question.optionAnswers.filter((_, i) => i !== index);
                  const newCorrect = question.correctAnswers
                    .filter((i) => i !== index)
                    .map((i) => (i > index ? i - 1 : i));
                  setQuestion({ ...question, optionAnswers: newOptions, correctAnswers: newCorrect });
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}

          {question.optionAnswers.length < 6 && (
            <Button
              variant="outlined"
              onClick={() =>
                setQuestion({
                  ...question,
                  optionAnswers: [...question.optionAnswers, ""],
                })
              }
            >
              + Add Answer
            </Button>
          )}

          <Box display="flex" justifyContent="space-between" gap={2} mt={4}>
            <Button
              variant="contained"
              size="large"
              sx={{ flex: 1 }}
              type="submit"
            >
              Save Question
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="error"
              onClick={() => navigate(`/game/${game_id}`)}
              sx={{ flex: 1 }}
            >
              Back
            </Button>
          </Box>
        </Box>
        <Dialog
          open={openResetDialog}
          onClose={() => setOpenResetDialog(false)}
        >
          <DialogTitle>Confirm Reset</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all question fields? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenResetDialog(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleReset();
                setOpenResetDialog(false);
              }}
              color="error"
            >
              Confirm Reset
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default SingleQuestion;