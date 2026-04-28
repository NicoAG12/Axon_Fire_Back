import React from 'react';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Inicio' }} />
      <Stack.Screen name="users/create" options={{ title: 'Crear Usuario' }} />
      <Stack.Screen name="alerts/create" options={{ title: 'Crear Alerta' }} />
      <Stack.Screen name="alerts/list" options={{ title: 'Alertas' }} />
      <Stack.Screen name="alerts/respond" options={{ title: 'Responder' }} />
    </Stack>
  );
}
