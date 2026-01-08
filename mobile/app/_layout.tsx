import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
