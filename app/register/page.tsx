'use client';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline
} from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Poppins } from 'next/font/google';
import toast, { Toaster } from 'react-hot-toast';

import { AppDispatch, RootState } from '../store/store';
import { registerUser } from '../store/authSlice';

const poppins = Poppins({ weight: ['400','500','600','700'], subsets: ['latin'] });

const theme = createTheme({
  typography: {
    fontFamily: `${poppins.style.fontFamily}, sans-serif`,
  },
});

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    const resultAction = await dispatch(registerUser({ username, email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success("Registration successful!");
      router.push('/login');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Container maxWidth="sm" className={poppins.className}>
        <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h4" gutterBottom>Register</Typography>

          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
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
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account? <a href="/login">Login</a>
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
