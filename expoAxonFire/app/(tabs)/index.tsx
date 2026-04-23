import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';

const API_URL = 'http://192.168.88.12:3000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerPushToken(usuarioId: string) {
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    console.log('Push Token:', token);

    await fetch(`${API_URL}/notificaciones/registrar-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuarioId,
        token: token,
        plataforma: 'iOS'
      })
    });
    console.log('Token registrado en backend');
  } catch (error) {
    console.error('Error registrando token:', error);
  }
}

async function crearAlerta(data: any) {
  try {
    const response = await fetch(`${API_URL}/alerta/crear-con-notificacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      Alert.alert('Alerta creada', `ID: ${result.id}`);
    } else {
      Alert.alert('Error', result.error);
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo conectar al backend');
  }
}

export default function HomeScreen() {
  const [usuarioId, setUsuarioId] = useState('');
  const [subCategoriaId, setSubCategoriaId] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [tokenRegistrado, setTokenRegistrado] = useState(false);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
      Alert.alert(
        notification.request.content.title || 'Alerta',
        notification.request.content.body || 'Nueva notificación'
      );
    });

    return () => subscription.remove();
  }, []);

  const handleRegistrarToken = async () => {
    if (!usuarioId.trim()) {
      Alert.alert('Error', 'Ingresá un usuario_id');
      return;
    }
    await registerPushToken(usuarioId.trim());
    setTokenRegistrado(true);
    Alert.alert('Token Registrado', 'Ya podés recibir notificaciones');
  };

  const handleCrearAlerta = () => {
    if (!subCategoriaId.trim() || !ubicacion.trim() || !usuarioId.trim()) {
      Alert.alert('Error', 'Completá todos los campos requeridos');
      return;
    }
    crearAlerta({
      sub_categoria_alerta_id: subCategoriaId.trim(),
      ubicacion: ubicacion.trim(),
      observaciones: observaciones.trim(),
      usuario_alta_alerta: usuarioId.trim()
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Axion Fire</Text>
        <Text style={styles.subtitle}>Sistema de Alerts</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario ID (para registrar token)"
          value={usuarioId}
          onChangeText={setUsuarioId}
        />
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleRegistrarToken}>
          <Text style={styles.buttonText}>Registrar Token</Text>
        </TouchableOpacity>
        {tokenRegistrado && <Text style={styles.successText}>Token registrado</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crear Alerta</Text>
        <TextInput
          style={styles.input}
          placeholder="Sub Categoría ID"
          value={subCategoriaId}
          onChangeText={setSubCategoriaId}
        />
        <TextInput
          style={styles.input}
          placeholder="Ubicación"
          value={ubicacion}
          onChangeText={setUbicacion}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Observaciones"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
        />
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleCrearAlerta}>
          <Text style={styles.buttonTextPrimary}>Crear Alerta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D3D47',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  subtitle: {
    fontSize: 18,
    color: '#A1CEDC',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#2A4D57',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1D3D47',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonPrimary: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonSecondary: {
    backgroundColor: '#4A9D8C',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});