'use client';
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, TextField, Button, Typography, Box, IconButton, InputAdornment, CssBaseline
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import { Poppins } from 'next/font/google';
import { AppDispatch, RootState } from '../store/store';
import { login, logout } from '../store/authSlice';
import { useRouter } from 'next/navigation';

const poppins = Poppins({ weight: ['400','500','600','700'], subsets: ['latin'] });
const theme = createTheme({ typography: { fontFamily: `'${poppins.style.fontFamily}', sans-serif` } });

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { token, loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Handle successful login
  useEffect(() => {
    if (token && loginAttempted) {
      toast.success("Login Successful!");
      router.replace("/products");
      setLoginAttempted(false); // reset after redirect
    }
  }, [token, loginAttempted, router]);

  // Handle login error
  useEffect(() => {
    if (error && loginAttempted) {
      toast.error(error);
      // Clear token in case something is still set
      dispatch(logout());
      setLoginAttempted(false); // reset after showing error
    }
  }, [error, loginAttempted, dispatch]);

  const handleLogin = () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoginAttempted(true); // mark that user attempted login
    dispatch(login({ email, password }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Container maxWidth="sm" className={poppins.className}>
        <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h4" gutterBottom>Login</Typography>

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              endAdornment: password && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Don’t have an account? <a href="/register">Register</a>
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
