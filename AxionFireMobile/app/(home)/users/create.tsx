import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { usersApi } from '../../../src/api';

export default function CreateUserScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'ADMIN' | 'BOMBERO' | 'USER'>('USER');
  const [bomberoNombre, setBomberoNombre] = useState('');
  const [bomberoApellido, setBomberoApellido] = useState('');
  const [bomberoRango, setBomberoRango] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleCreateUser = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor complete usuario y contraseña');
      return;
    }

    if (rol === 'BOMBERO' && (!bomberoNombre.trim() || !bomberoApellido.trim())) {
      Alert.alert('Error', 'Complete los datos del bombero');
      return;
    }

    setIsLoading(true);
    try {
      const data: any = {
        nombre_usuario: username,
        password,
        rol,
      };

      if (rol === 'BOMBERO') {
        data.bombero = {
          nombre: bomberoNombre,
          apellido: bomberoApellido,
          rango: bomberoRango,
        };
      }

      await usersApi.create(data);
      Alert.alert('Éxito', 'Usuario creado correctamente');
      router.back();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear usuario';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Rol</Text>
        <View style={styles.rolContainer}>
          {(['USER', 'ADMIN', 'BOMBERO'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rolButton, rol === r && styles.rolButtonActive]}
              onPress={() => setRol(r)}
            >
              <Text style={[styles.rolText, rol === r && styles.rolTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {rol === 'BOMBERO' && (
          <>
            <Text style={styles.label}>Datos del Bombero</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#999"
              value={bomberoNombre}
              onChangeText={setBomberoNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor="#999"
              value={bomberoApellido}
              onChangeText={setBomberoApellido}
            />
            <TextInput
              style={styles.input}
              placeholder="Rango (CAD, OFI, BOM)"
              placeholderTextColor="#999"
              value={bomberoRango}
              onChangeText={setBomberoRango}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCreateUser}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear Usuario</Text>
          )}
        </TouchableOpacity>
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
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  rolContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rolButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#16213e',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  rolButtonActive: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  rolText: {
    color: '#999',
    fontWeight: '600',
  },
  rolTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
