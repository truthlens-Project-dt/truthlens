import Constants from 'expo-constants';
import { Platform } from 'react-native';

// For physical device: replace with your computer's local IP
// Find it with: ipconfig (Windows) or ifconfig (Mac)
const LOCAL_IP = '192.168.1.YOUR_IP';   // ← CHANGE THIS

export const API_BASE =
  Constants.expoConfig?.extra?.apiUrl ||
  (Platform.OS === 'android'
    ? `http://${LOCAL_IP}:8000`         // Physical Android
    : Platform.OS === 'ios'
    ? `http://${LOCAL_IP}:8000`         // Physical iOS
    : 'http://localhost:8000');          // Web / emulator