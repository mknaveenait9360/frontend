import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface RegisterArgs {
  username: string;
  email: string;
  password: string;
}

// Async thunk for login
export const login = createAsyncThunk<string, LoginArgs, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        // Clear any existing token if login fails
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        return rejectWithValue(data.message || 'Invalid email or password');
      }

      if (typeof window !== 'undefined') localStorage.setItem('token', data.access_token);
      return data.access_token;
    } catch (error: unknown) {
      if(error instanceof Error){
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Network error');
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk<void, RegisterArgs, { rejectValue: string }>(
  'auth/registerUser',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        return rejectWithValue(data.message || 'Registration failed');
      }
    } catch (error: unknown) {
      if(error instanceof Error){
        return rejectWithValue(error.message )
      }
      return rejectWithValue('Network error');
    }
  }
);

// Initial state: do not read localStorage at load; start with null
const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.error = null;
      if (typeof window !== 'undefined') localStorage.removeItem('token');
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.token = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.token = null; // ensure invalid login does not keep token
        state.error = action.payload || 'Invalid email or password';
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
export const selectAuth = (state: RootState) => state.auth;
