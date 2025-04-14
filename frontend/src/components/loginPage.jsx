import { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import AUTH from "../Constant";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signin = async () => {
    const url = "http://localhost:5005/admin/auth/login"
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    })
    const data = await response.json()
    if (data.token) {
      localStorage.setItem(AUTH.Token_key, data.token)
      console.log("token saved")
    }
  }
  return (
    <Container maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h5" gutterBottom>
                    Welcome! Please login to continue
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
          label="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" onClick={signin}>
                    Login Submit
        </Button>
      </Box>
    </Container>
  )
}
export default Login;