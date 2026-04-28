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
import { respuestasApi, EstadoRespuesta } from '../../../src/api/respuestas';
import { useAuth } from '../../../src/context/AuthContext';

export default function RespondAlertScreen() {
  const { user } = useAuth();
  const [alertaId, setAlertaId] = useState('');
  const [estado, setEstado] = useState<EstadoRespuesta>('PENDIENTE');
  const [isLoading, setIsLoading] = useState(false);

  const handleRespond = async () => {
    if (!alertaId.trim()) {
      Alert.alert('Error', 'Ingrese el ID de la alerta');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'No hay usuario logueado');
      return;
    }

    setIsLoading(true);
    try {
      await respuestasApi.respond(alertaId, user.id, {
        estado_respuesta: estado,
        fecha_hora: new Date().toISOString(),
      });
      Alert.alert('Éxito', 'Respuesta registrada correctamente');
      setAlertaId('');
      setEstado('PENDIENTE');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al responder';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const estados: EstadoRespuesta[] = ['PENDIENTE', 'ACEPTADO', 'RECHAZADO'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="ID de la Alerta"
          placeholderTextColor="#999"
          value={alertaId}
          onChangeText={setAlertaId}
        />

        <Text style={styles.label}>Estado de Respuesta</Text>
        <View style={styles.estadoContainer}>
          {estados.map((e) => (
            <TouchableOpacity
              key={e}
              style={[
                styles.estadoButton,
                estado === e && getEstadoButtonStyle(e),
              ]}
              onPress={() => setEstado(e)}
            >
              <Text
                style={[
                  styles.estadoText,
                  estado === e && styles.estadoTextActive,
                ]}
              >
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRespond}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirmar Respuesta</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getEstadoButtonStyle = (estado: string) => {
  if (estado === 'ACEPTADO') return { backgroundColor: '#32CD32', borderColor: '#32CD32' };
  if (estado === 'RECHAZADO') return { backgroundColor: '#DC143C', borderColor: '#DC143C' };
  return { backgroundColor: '#FFA500', borderColor: '#FFA500' };
};

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
  estadoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  estadoButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#16213e',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },

  estadoText: {
    color: '#999',
    fontWeight: '600',
  },
  estadoTextActive: {
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
