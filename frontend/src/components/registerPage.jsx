import { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import AUTH from "../Constant";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const register = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
  
    const url = "http://localhost:5005/admin/auth/register";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        name: username
      })
    })
      .then((response) => response.json().then(data => ({ status: response.status, ok: response.ok, data })))
      .then(({ status, ok, data }) => {
        if (ok && data.token) {
          localStorage.setItem(AUTH.Token_key, data.token);
          console.log("Token saved successfully!");
        } else {
          alert(data.error || `Registration failed with status ${status}.`);
        }
      })
      .catch((error) => {
        console.error("Register error:", error);
        alert("Network error.");
      });
  };
  
  return (
    <Container maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h5" gutterBottom>
                    Welcome! Please signup to continue
        </Typography>
        <TextField
          required
          id="outlined-required"
          label="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          required
          id="outlined-required"
          label="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          required
          id="outlined-required"
          label="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          required
          id="outlined-required"
          label="confirm password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button variant="contained" onClick={register}>
                    Signup Submit
        </Button>
      </Box>
    </Container>
  )
}
export default Signup;