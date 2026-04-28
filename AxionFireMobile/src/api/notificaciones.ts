import api from './client';
import { API_ENDPOINTS } from './config';

export interface RegisterTokenRequest {
  usuario_id: string;
  token: string;
  plataforma?: 'android' | 'ios' | 'web';
}

export const notificacionesApi = {
  registerToken: async (data: RegisterTokenRequest): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.NOTIFICACIONES.REGISTER_TOKEN, data);
    return response.data;
  },
};
