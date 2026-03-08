import React from 'react';
import { ThemeProvider }  from './theme/ThemeContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage   from './auth/LoginPage';
import VideoUpload from './components/VideoUpload';
import './App.css';

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', padding: '60px', textAlign: 'center' }}>Loading...</div>;
  return user ? <VideoUpload /> : <LoginPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}