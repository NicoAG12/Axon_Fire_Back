import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      title: 'Crear Usuario',
      description: 'Registrar nuevo usuario en el sistema',
      route: '/(home)/users/create',
      roles: ['ADMIN'],
      color: '#E63946',
    },
    {
      title: 'Crear Alerta',
      description: 'Registrar nueva alerta de emergencia',
      route: '/(home)/alerts/create',
      roles: ['ADMIN', 'USER'],
      color: '#FFA500',
    },
    {
      title: 'Ver Alertas',
      description: 'Consultar lista de alertas',
      route: '/(home)/alerts/list',
      roles: ['ADMIN', 'USER', 'BOMBERO'],
      color: '#4169E1',
    },
    {
      title: 'Responder Alerta',
      description: 'Confirmar o rechazar asistencia',
      route: '/(home)/alerts/respond',
      roles: ['BOMBERO'],
      color: '#32CD32',
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => user?.rol && item.roles.includes(user.rol)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenido</Text>
          <Text style={styles.username}>{user?.rol}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Menú Principal</Text>
      <View style={styles.menuGrid}>
        {filteredItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#999',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#16213e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  logoutText: {
    color: '#E63946',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 16,
  },
  menuGrid: {
    gap: 12,
  },
  menuCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
    borderLeftWidth: 4,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#999',
  },
});
