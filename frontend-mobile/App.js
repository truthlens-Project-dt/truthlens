import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen    from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { colors }   from './src/theme/colors';

// Install bottom tabs if not done: npm install @react-navigation/bottom-tabs
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown:       false,
          tabBarStyle:       { backgroundColor: colors.surface, borderTopColor: colors.surfaceLight },
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen
          name="Detect"
          component={HomeScreen}
          options={{ tabBarLabel: 'Detect', tabBarIcon: () => null }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ tabBarLabel: 'History', tabBarIcon: () => null }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}