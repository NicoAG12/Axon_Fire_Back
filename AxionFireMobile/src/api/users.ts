import api from './client';
import { API_ENDPOINTS } from './config';

export interface BomberoData {
  nombre: string;
  apellido: string;
  rango: string;
}

export interface CreateUserRequest {
  nombre_usuario: string;
  password: string;
  rol: 'ADMIN' | 'BOMBERO' | 'USER';
  bombero?: BomberoData;
}

export const usersApi = {
  create: async (data: CreateUserRequest): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.USERS.CREATE, data);
    return response.data;
  },
};
