// React & Router
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// MUI components
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import Alert from '@mui/material/Alert';

// Ant Design Modal
import { Modal } from 'antd';

// Auth constant (stores localStorage keys)
import AUTH from "../Constant";

// Custom component for rendering captcha image
import CanvasCaptcha from './CanvasCaptcha'; 

const Login = (props) => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error state for display
  const [error, setError] = useState("");

  // Captcha logic
  const [captcha, setCaptcha] = useState("");             // Correct captcha
  const [inputCaptcha, setInputCaptcha] = useState("");   // User input captcha

  const navigate = useNavigate();

  // Function to randomly generate a 4-character captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptcha(result);
  };

  // Generate captcha on initial mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Login handler
  const signin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const url = "http://localhost:5005/admin/auth/login";

    // UI testing bypass for captcha
    const isBypassCaptcha = import.meta.env.MODE === 'development' && inputCaptcha.toUpperCase() === 'AAAA';
    // Captcha validation first
    if (inputCaptcha.toUpperCase() !== captcha.toUpperCase() && !isBypassCaptcha) {
      Modal.error({
        title: 'Invalid Captcha',
        content: 'The captcha you entered is incorrect. Please try again.',
      });
      generateCaptcha(); // Regenerate on failure
      return;
    }

    // Make POST request with email and password
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    // If login successful, save token and email
    if (data.token) {
      localStorage.setItem(AUTH.USER_KEY, email);
      localStorage.setItem(AUTH.Token_key, data.token);
      props.setToken(data.token); // Set parent state
      navigate("/dashboard");     // Redirect to dashboard
    } else {
      // Show error from backend or generic message
      setError(data.error || "Legendary Secret Key Login Failed");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Form box */}
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
        }}
      >
        {/* Title */}
        <Typography variant="h5" gutterBottom>
          Welcome! Please login to continue
        </Typography>

        {/* Error alert */}
        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {/* Email input */}
        <TextField
          required
          label="Email"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          id="email-login-input"
        />

        {/* Password input */}
        <TextField
          required
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          variant="outlined"
          id="password-login-input"
        />

        {/* Captcha input and image */}
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            required
            label="Captcha"
            value={inputCaptcha}
            onChange={(e) => setInputCaptcha(e.target.value)}
          />
          <CanvasCaptcha text={captcha} />
        </Box>

        {/* Submit button */}
        <Button type="submit" variant="contained">
          Login Submit
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
