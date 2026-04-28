import api from './client';
import { API_ENDPOINTS } from './config';

export type EstadoRespuesta = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

export interface RespondToAlertRequest {
  estado_respuesta: EstadoRespuesta;
  fecha_hora: string;
}

export interface RespuestaAlerta {
  id: string;
  alerta_id: string;
  usuario_id: string;
  estado_respuesta: EstadoRespuesta;
  fecha_hora: string;
}

export const respuestasApi = {
  getAll: async (): Promise<RespuestaAlerta[]> => {
    const response = await api.get(API_ENDPOINTS.RESPUESTAS_ALERTAS.LIST);
    return response.data;
  },

  getById: async (id: string): Promise<RespuestaAlerta> => {
    const response = await api.get(API_ENDPOINTS.RESPUESTAS_ALERTAS.BY_ID(id));
    return response.data;
  },

  respond: async (
    alertaId: string,
    usuarioId: string,
    data: RespondToAlertRequest
  ): Promise<RespuestaAlerta> => {
    const response = await api.post(
      API_ENDPOINTS.RESPUESTAS_ALERTAS.RESPOND(alertaId, usuarioId),
      data
    );
    return response.data;
  },

  create: async (data: {
    alerta_id: string;
    usuario_id: string;
    estado_respuesta: EstadoRespuesta;
    fecha_hora: string;
  }): Promise<RespuestaAlerta> => {
    const response = await api.post(API_ENDPOINTS.RESPUESTAS_ALERTAS.LIST, data);
    return response.data;
  },

  update: async (
    id: string,
    data: { estado_respuesta?: EstadoRespuesta; fecha_hora?: string }
  ): Promise<RespuestaAlerta> => {
    const response = await api.put(API_ENDPOINTS.RESPUESTAS_ALERTAS.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.RESPUESTAS_ALERTAS.BY_ID(id));
  },
};
