import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE   = 'http://localhost:8000';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem('tl_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE}/api/v1/auth/me`)
        .then(r => setUser(r.data))
        .catch(() => { logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (email, username, password) => {
    const r = await axios.post(`${API_BASE}/api/v1/auth/register`,
      { email, username, password });
    _saveSession(r.data);
  };

  const login = async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const r = await axios.post(`${API_BASE}/api/v1/auth/login`, form);
    _saveSession(r.data);
  };

  const logout = () => {
    localStorage.removeItem('tl_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const _saveSession = (data) => {
    localStorage.setItem('tl_token', data.access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
    setToken(data.access_token);
    setUser({ username: data.username, email: data.email });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);