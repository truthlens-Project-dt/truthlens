import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

export async function registerUser(email, username, password) {
  const r = await axios.post(`${API_BASE}/api/v1/auth/register`,
    { email, username, password });
  await _saveToken(r.data.access_token);
  return r.data;
}

export async function loginUser(email, password) {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const r = await axios.post(`${API_BASE}/api/v1/auth/login`, form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  await _saveToken(r.data.access_token);
  return r.data;
}

export async function logoutUser() {
  await AsyncStorage.removeItem('tl_token');
  delete axios.defaults.headers.common['Authorization'];
}

export async function loadStoredToken() {
  const token = await AsyncStorage.getItem('tl_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
  }
  return null;
}

async function _saveToken(token) {
  await AsyncStorage.setItem('tl_token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}