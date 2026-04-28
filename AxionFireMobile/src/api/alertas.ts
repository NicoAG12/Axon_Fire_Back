import api from './client';
import { API_ENDPOINTS } from './config';

export interface CreateAlertRequest {
  sub_categoria_alerta_id: string;
  ubicacion: string;
  observaciones: string;
  fecha_hora: string;
  estado_alerta_id: string;
  usuario_alta_alerta: string;
}

export interface CreateAlertWithNotificationRequest {
  sub_categoria_alerta_id: string;
  ubicacion: string;
  observaciones: string;
  usuario_alta_alerta: string;
  destinatariosIds?: string[];
}

export interface DateRangeRequest {
  fecha_desde: string;
  fecha_hasta: string;
}

export interface Alerta {
  id: string;
  sub_categoria_alerta_id: string;
  ubicacion: string;
  observaciones: string;
  fecha_hora: string;
  estado_alerta_id: string;
  usuario_alta_alerta: string;
}

export const alertasApi = {
  create: async (data: CreateAlertRequest): Promise<Alerta> => {
    const response = await api.post(API_ENDPOINTS.ALERTAS.CREATE, data);
    return response.data;
  },

  createWithNotification: async (
    data: CreateAlertWithNotificationRequest
  ): Promise<Alerta> => {
    const response = await api.post(
      API_ENDPOINTS.ALERTAS.CREATE_WITH_NOTIFICATION,
      data
    );
    return response.data;
  },

  getByDateRange: async (data: DateRangeRequest): Promise<Alerta[]> => {
    const response = await api.post(API_ENDPOINTS.ALERTAS.BY_DATE_RANGE, data);
    return response.data;
  },

  getById: async (id: string): Promise<Alerta> => {
    const response = await api.get(API_ENDPOINTS.ALERTAS.BY_ID(id));
    return response.data;
  },
};
