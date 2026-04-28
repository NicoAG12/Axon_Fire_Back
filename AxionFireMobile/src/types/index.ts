export interface User {
  id: string;
  rol: 'ADMIN' | 'BOMBERO' | 'USER';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface CategoriaAlerta {
  id: string;
  nombre_categoria: string;
}

export interface SubcategoriaAlerta {
  id: string;
  categoria_alerta_id: string;
  nombre_sub_categoria: string;
}

export interface EstadoAlerta {
  id: string;
  nombre_estado: string;
}

export interface Bombero {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  rango: string;
}

export interface BomberoRango {
  id: string;
  nombre_rol: string;
}

export type TipoRespuesta = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
