import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import { colors } from './src/theme/colors';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle:      { backgroundColor: colors.background },
          headerTintColor:  colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          cardStyle:        { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '🔍 TruthLens', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}