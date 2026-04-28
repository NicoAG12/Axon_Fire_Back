import api from './client';
import { API_ENDPOINTS } from './config';

export interface LoginRequest {
  nombre_usuario: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  rol: 'ADMIN' | 'BOMBERO' | 'USER';
  token: string;
  msj: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },
};
