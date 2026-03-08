import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { theme }           = useTheme();

  const [mode,     setMode]     = useState('login');   // 'login' | 'register'
  const [email,    setEmail]    = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: theme.background,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)', borderRadius: '20px',
        padding: '40px', width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '2em' }}>🔍 TruthLens</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px', fontSize: '0.9em' }}>
          AI-Powered Deepfake Detection
        </p>

        {/* Tab Switch */}
        <div style={{ display: 'flex', marginBottom: '24px', background: '#f0f0f0', borderRadius: '10px', padding: '4px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '0.9em',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#667eea' : '#888',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}>
              {m === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Fields */}
        {[
          { show: true,               label: 'Email',    value: email,    set: setEmail,    type: 'email' },
          { show: mode==='register',  label: 'Username', value: username, set: setUsername, type: 'text' },
          { show: true,               label: 'Password', value: password, set: setPassword, type: 'password' },
        ].filter(f => f.show).map(f => (
          <div key={f.label} style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {f.label}
            </label>
            <input
              type={f.type} value={f.value}
              onChange={e => f.set(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #ddd',
                borderRadius: '10px', fontSize: '1em', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}

        {error && (
          <p style={{ color: '#e74c3c', fontSize: '0.85em', marginBottom: '12px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          onClick={submit} disabled={loading}
          style={{
            width: '100%', padding: '14px', border: 'none',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', borderRadius: '12px', fontSize: '1em',
            fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: '8px'
          }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}