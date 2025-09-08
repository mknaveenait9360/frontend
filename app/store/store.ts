// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productsReducer from './productsSlice'; // <-- import products slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer, // <-- add products slice here
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
