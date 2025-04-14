import { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import AUTH from "../Constant";
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const signin = async (e) => {
    e.preventDefault(); 
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
      props.setToken(data.token)
      navigate("/")
    }else{
      setError(data.error || "Legendary Secret Key Login Failed")
    }
  }
  return (
    <Container maxWidth="sm" sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Box
        component="form"
        onSubmit={signin}
        sx={{
          width: '100%',
          maxWidth: { xs: 360, sm: 500, md: 800 },
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          boxShadow: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'background.paper',
          minHeight: 'auto',
        }}
      >
        <Typography variant="h5" gutterBottom>
                    Welcome! Please login to continue
        </Typography>
        {error &&(
          <Alert severity="error">{error}</Alert>
        )}
        <TextField
          required
          label="Email"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
        />
        <TextField
          required
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <Button type="submit" variant="contained">
                    Login Submit
        </Button>
      </Box>
    </Container>
  )
}
export default Login;