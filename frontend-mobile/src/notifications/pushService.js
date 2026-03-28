import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_BASE } from '../config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token     = tokenData.data;

  // Register token with backend
  try {
    await axios.post(`${API_BASE}/api/v1/notifications/register-token`, {
      token,
      platform: Platform.OS
    });
    console.log('Push token registered:', token);
  } catch (e) {
    console.error('Failed to register push token:', e.message);
  }

  return token;
}

export function sendLocalNotification(title, body) {
  Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,   // null = send immediately
  });
}