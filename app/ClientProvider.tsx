'use client';

import { Provider, useDispatch } from 'react-redux';
import store, { AppDispatch } from './store/store';
import { useEffect } from 'react';
import { setToken } from './store/authSlice';

interface ClientProviderProps {
  children: React.ReactNode;
}

function InitAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) dispatch(setToken(token));
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <Provider store={store}>
      <InitAuth>{children}</InitAuth>
    </Provider>
  );
}
