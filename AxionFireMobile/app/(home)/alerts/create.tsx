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
import { alertasApi } from '../../../src/api';
import { useAuth } from '../../../src/context/AuthContext';

const ESTADOS_ALERTA = [
  { id: '1', nombre: 'PENDIENTE' },
  { id: '2', nombre: 'EN CURSO' },
  { id: '3', nombre: 'FINALIZADO' },
];

const SUBCATEGORIAS = [
  { id: '1', nombre: 'INCENDIO ESTRUCTURAL' },
  { id: '2', nombre: 'RESCATE AUTOMOVIL' },
  { id: '3', nombre: 'OTRO TIPO' },
];

export default function CreateAlertScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estadoId, setEstadoId] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const [destinatariosIds, setDestinatariosIds] = useState('');

  const handleCreateAlert = async () => {
    if (!subcategoriaId || !ubicacion.trim()) {
      Alert.alert('Error', 'Complete los campos obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      if (sendNotification) {
        await alertasApi.createWithNotification({
          sub_categoria_alerta_id: subcategoriaId,
          ubicacion,
          observaciones,
          usuario_alta_alerta: user!.id,
          destinatariosIds: destinatariosIds
            ? destinatariosIds.split(',').map((id: string) => id.trim())
            : [],
        });
      } else {
        await alertasApi.create({
          sub_categoria_alerta_id: subcategoriaId,
          ubicacion,
          observaciones,
          fecha_hora: new Date().toISOString(),
          estado_alerta_id: estadoId,
          usuario_alta_alerta: user!.id,
        });
      }
      Alert.alert('Éxito', 'Alerta creada correctamente');
      router.back();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear alerta';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Text style={styles.label}>Subcategoría</Text>
        <View style={styles.optionsContainer}>
          {SUBCATEGORIAS.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[
                styles.optionButton,
                subcategoriaId === sub.id && styles.optionButtonActive,
              ]}
              onPress={() => setSubcategoriaId(sub.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  subcategoriaId === sub.id && styles.optionTextActive,
                ]}
                numberOfLines={2}
              >
                {sub.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ubicación"
          placeholderTextColor="#999"
          value={ubicacion}
          onChangeText={setUbicacion}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Observaciones"
          placeholderTextColor="#999"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.switchContainer}
          onPress={() => setSendNotification(!sendNotification)}
        >
          <View style={[styles.checkbox, sendNotification && styles.checkboxActive]} />
          <Text style={styles.switchLabel}>Enviar notificación</Text>
        </TouchableOpacity>

        {sendNotification && (
          <TextInput
            style={styles.input}
            placeholder="IDs destinatarios (separados por coma)"
            placeholderTextColor="#999"
            value={destinatariosIds}
            onChangeText={setDestinatariosIds}
          />
        )}

        {!sendNotification && (
          <>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.optionsContainer}>
              {ESTADOS_ALERTA.map((estado) => (
                <TouchableOpacity
                  key={estado.id}
                  style={[
                    styles.optionButton,
                    estadoId === estado.id && styles.optionButtonActive,
                  ]}
                  onPress={() => setEstadoId(estado.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      estadoId === estado.id && styles.optionTextActive,
                    ]}
                  >
                    {estado.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCreateAlert}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {sendNotification ? 'Crear y Notificar' : 'Crear Alerta'}
            </Text>
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#16213e',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  optionButtonActive: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  optionText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E63946',
  },
  checkboxActive: {
    backgroundColor: '#E63946',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
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
