import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView
} from 'react-native';
import { registerUser, loginUser } from '../auth/authService';
import { colors } from '../theme/colors';

export default function LoginScreen({ onLogin }) {
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        data = await loginUser(email, password);
      } else {
        data = await registerUser(email, username, password);
      }
      onLogin(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>🔍</Text>
        <Text style={styles.title}>TruthLens</Text>
        <Text style={styles.subtitle}>AI-Powered Deepfake Detection</Text>

        {/* Tab */}
        <View style={styles.tabs}>
          {['login', 'register'].map(m => (
            <TouchableOpacity key={m} style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => { setMode(m); setError(''); }}>
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'login' ? 'Log In' : 'Register'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Inputs */}
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" />

        {mode === 'register' && (
          <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#aaa"
            value={username} onChangeText={setUsername} autoCapitalize="none" />
        )}

        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa"
          value={password} onChangeText={setPassword} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnText}>{mode === 'login' ? 'Log In' : 'Create Account'}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  inner:        { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logo:         { fontSize: 52, textAlign: 'center' },
  title:        { fontSize: 32, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginTop: 6 },
  subtitle:     { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 36 },
  tabs:         {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: 12, padding: 4, marginBottom: 24
  },
  tab:          { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive:    { backgroundColor: colors.primary },
  tabText:      { color: colors.textMuted, fontWeight: '600' },
  tabTextActive:{ color: colors.white },
  input:        {
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 14, color: colors.text, fontSize: 15,
    marginBottom: 14, borderWidth: 1, borderColor: colors.surfaceLight
  },
  error:        { color: colors.fake, textAlign: 'center', marginBottom: 10, fontSize: 13 },
  btn:          {
    backgroundColor: colors.primary, borderRadius: 50,
    paddingVertical: 16, alignItems: 'center', marginTop: 8
  },
  btnText:      { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});