import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { alertasApi, Alerta } from '../../../src/api/alertas';

export default function AlertsListScreen() {
  const [alerts, setAlerts] = useState<Alerta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await alertasApi.getByDateRange({
        fecha_desde: '2020-01-01T00:00:00.000Z',
        fecha_hasta: '2030-12-31T23:59:59.000Z',
      });
      setAlerts(data);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al cargar alertas';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAlertPress = (alert: Alerta) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const getEstadoColor = (estadoId: string) => {
    switch (estadoId) {
      case '1':
        return '#FFA500';
      case '2':
        return '#4169E1';
      case '3':
        return '#32CD32';
      default:
        return '#999';
    }
  };

  const renderAlert = ({ item }: { item: Alerta }) => (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={() => handleAlertPress(item)}
    >
      <View style={styles.alertHeader}>
        <View
          style={[styles.statusDot, { backgroundColor: getEstadoColor(item.estado_alerta_id) }]}
        />
        <Text style={styles.alertId}>Alerta #{item.id}</Text>
      </View>
      <Text style={styles.alertUbicacion}>{item.ubicacion}</Text>
      <Text style={styles.alertFecha}>
        {new Date(item.fecha_hora).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertas</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchAlerts}>
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {isLoading && alerts.length === 0 ? (
        <ActivityIndicator size="large" color="#E63946" style={styles.loader} />
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={fetchAlerts}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay alertas</Text>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAlert && (
              <>
                <Text style={styles.modalTitle}>Detalle de Alerta</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>{selectedAlert.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ubicación:</Text>
                  <Text style={styles.detailValue}>{selectedAlert.ubicacion}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Observaciones:</Text>
                  <Text style={styles.detailValue}>{selectedAlert.observaciones}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha/Hora:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedAlert.fecha_hora).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado ID:</Text>
                  <Text style={styles.detailValue}>{selectedAlert.estado_alerta_id}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: '#E63946',
    fontWeight: '600',
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  alertCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertId: {
    color: '#E63946',
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertUbicacion: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  alertFecha: {
    color: '#999',
    fontSize: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E63946',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#999',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
