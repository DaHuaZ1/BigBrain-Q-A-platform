import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import AUTH from "../Constant";
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import { Modal } from 'antd';
import CanvasCaptcha from './CanvasCaptcha';

const Signup = (props) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");
  const navigate = useNavigate()
  const [error, setError] = useState("");

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);
  const register = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Modal.error({
        title: 'Password Mismatch',
        content: 'The passwords you entered do not match. Please double-check.',
      });
      return;
    }

    if (inputCaptcha.toUpperCase() !== captcha.toUpperCase()) {
      Modal.error({
        title: 'Invalid Captcha',
        content: 'The captcha you entered is incorrect. Please try again.',
      });
      generateCaptcha();
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
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem(AUTH.USER_KEY, email)
          localStorage.setItem(AUTH.Token_key, data.token);
          console.log("Token saved successfully!");
          props.setToken(data.token);
          navigate("/dashboard");
        } else {
          setError(data.error || "Legendary Secret Key Registration Failed");
        }
      })
      .catch((error) => {
        console.error("Register error:", error);
        setError("Network error.");
      });
  }
  
  return (
    <Container maxWidth="sm" sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 4,
    }}>
      <Box
        component="form"
        onSubmit={register}
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
        }}
      >
        <Typography variant="h5" gutterBottom>
                    Welcome! Please signup to continue
        </Typography>
        {error && (
          <Alert severity="error">{error}</Alert>
        )}
        <TextField
          required
          id="email-register-input"
          label="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          required
          id="username-register-input"
          label="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          required
          id="password-register-input"
          label="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          required
          id="confirm-password-register-input"
          label="confirm password"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {/* Captcha */}
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            required
            label="Captcha"
            value={inputCaptcha}
            onChange={(e) => setInputCaptcha(e.target.value)}
          />
          <CanvasCaptcha text={captcha} />
        </Box>
        <Button type="submit" variant="contained">
            Signup Submit
        </Button>
      </Box>
    </Container>
  )
}
export default Signup;