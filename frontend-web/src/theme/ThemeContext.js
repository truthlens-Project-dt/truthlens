import React, { createContext, useContext, useState } from 'react';

const themes = {
  dark: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    surface:    'rgba(255,255,255,0.05)',
    text:       '#ffffff',
    textMuted:  'rgba(255,255,255,0.6)',
    border:     'rgba(255,255,255,0.2)',
    card:       'rgba(255,255,255,0.95)',
    cardText:   '#333333',
  },
  light: {
    background: 'linear-gradient(135deg, #e8ecf5 0%, #dce4f5 50%, #c8d6f0 100%)',
    surface:    'rgba(0,0,0,0.05)',
    text:       '#1a1a2e',
    textMuted:  'rgba(0,0,0,0.55)',
    border:     'rgba(0,0,0,0.15)',
    card:       '#ffffff',
    cardText:   '#333333',
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');
  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark');
  return (
    <ThemeContext.Provider value={{ theme: themes[mode], mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);