export const API_BASE_URL = 'http://192.168.88.8:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  USERS: {
    CREATE: '/usuarios/crear',
  },
  ALERTAS: {
    CREATE: '/alerta/crear',
    CREATE_WITH_NOTIFICATION: '/alerta/crear-con-notificacion',
    BY_DATE_RANGE: '/alerta/rango',
    BY_ID: (id: string) => `/alerta/${id}`,
  },
  RESPUESTAS_ALERTAS: {
    LIST: '/respuestas_alertas',
    BY_ID: (id: string) => `/respuestas_alertas/${id}`,
    RESPOND: (alertaId: string, usuarioId: string) =>
      `/respuestas_alertas/responder/${alertaId}/${usuarioId}`,
  },
  NOTIFICACIONES: {
    REGISTER_TOKEN: '/notificaciones/registrar-token',
  },
};
