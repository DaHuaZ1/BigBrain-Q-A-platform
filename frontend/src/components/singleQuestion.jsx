import React, {useEffect,useState} from "react";
import { useParams } from "react-router-dom";
import { fetchAllGames } from "../getAllGames";
import {
    Container, Typography, Box, TextField, Button, FormControl,
    InputLabel, Select, MenuItem, Checkbox, IconButton
  } from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import { putNewGame } from "../putNewGame";
  

const SingleQuestion = () => {
    const {game_id, question_id} = useParams();
    const [question, setQuestion] = useState(null);
    const [game, setGame] = useState(null);

    useEffect(() => {
        fetchAllGames()
        .then((data) => {
            const foundGame = data.games.find((game) => game.id === parseInt(game_id));
            if (foundGame) {
                setGame(foundGame);
                const foundQuestion = foundGame.questions.find((question) => question.id === parseInt(question_id));
                if (foundQuestion) {
                    setQuestion(foundQuestion);
                }
            }
        });
    }, []);

    const saveQuestion = (id, questionText, type, duration, points, media, optionAnswers, correctAnswers) => {
        const updatedQuestion = {
            id: id,
            question: questionText,
            type: type,
            duration: duration,
            points: points,
            media: media,
            optionAnswers: optionAnswers,
            correctAnswers: correctAnswers,
        };
        const updatedQuestions = game.questions.map((q) => (q.id === id ? updatedQuestion : q));
        const updatedGame = {
            ...game,
            questions: updatedQuestions,
        };
        putNewGame([updatedGame])
        .then(() => {
            setGame(updatedGame);
            setQuestion(updatedQuestion);
            console.log("Question updated successfully");
        })
        .catch((error) => {
            console.error("Error updating question:", error);
        });
    }
    if (!question) {
        return <div>Loading...</div>;
    }
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>{game.name}</Typography>
            <Typography variant="h6" gutterBottom>Editing Question #{question.id}</Typography>
        
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        
                <TextField
                    label="Question Text"
                    value={question.question}
                    onChange={(e) => setQuestion({ ...question, question: e.target.value })}
                    fullWidth
                    required
                />
        
                <FormControl fullWidth>
                    <InputLabel id="type-label">Question Type</InputLabel>
                    <Select
                        labelId="type-label"
                        value={question.type}
                        onChange={(e) => setQuestion({ ...question, type: e.target.value })}
                        label="Question Type"
                        required
                    >
                        <MenuItem value="single">Single Choice</MenuItem>
                        <MenuItem value="multiple">Multiple Choice</MenuItem>
                        <MenuItem value="judgement">Judgement</MenuItem>
                    </Select>
                </FormControl>
        
                <TextField
                    label="Time Limit (seconds)"
                    type="number"
                    value={question.duration}
                    onChange={(e) => setQuestion({ ...question, duration: parseInt(e.target.value) || 0 })}
                    fullWidth
                />
        
                <TextField
                    label="Points"
                    type="number"
                    value={question.points}
                    onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) || 0 })}
                    fullWidth
                />
        
                <TextField
                    label="YouTube URL (optional)"
                    value={question.media}
                    onChange={(e) => setQuestion({ ...question, media: e.target.value })}
                    fullWidth
                />
        
                <Typography variant="h6">Answer Options</Typography>
                {question.optionAnswers.map((answer, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Checkbox
                            checked={question.correctAnswers.includes(index)}
                            onChange={(e) => {
                                const newCorrect = e.target.checked
                                ? [...question.correctAnswers, index]
                                : question.correctAnswers.filter((i) => i !== index);
                                setQuestion({ ...question, correctAnswers: newCorrect });
                            }}
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
                        />
                        <IconButton
                            disabled={question.optionAnswers.length <= 2}
                            onClick={() => {
                                const newOptions = question.optionAnswers.filter((_, i) => i !== index);
                                const newCorrect = question.correctAnswers.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i));
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
                        Add Answer
                    </Button>
                    )}
        
                <Button
                    variant="contained"
                    size="large"
                    sx={{ mt: 3 }}
                    onClick={() =>saveQuestion(question.id, question.question, question.type, question.duration, question.points, question.media, question.optionAnswers, question.correctAnswers)}
                >
                    Save Question
                </Button>
            </Box>
        </Container>
    );
};

export default SingleQuestion;