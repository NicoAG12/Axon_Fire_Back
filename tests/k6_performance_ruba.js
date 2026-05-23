import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Configuración del perfil de carga (Ramp-up, Sustain, Ramp-down) y umbrales de SLA
export const options = {
  stages: [
    { duration: '5s', target: 20 },  // Ramp-up rápido: de 0 a 20 usuarios virtuales (VUs) en 5 segundos
    { duration: '15s', target: 20 }, // Sustain: mantener 20 VUs concurrentes por 15 segundos (estrés constante)
    { duration: '5s', target: 0 },   // Ramp-down: bajar a 0 VUs en 5 segundos
  ],
  thresholds: {
    // Definición de acuerdos de nivel de servicio (SLA) de performance
    http_req_failed: ['rate<0.01'],   // Menos del 1% de errores en las peticiones (Tolerancia de fallos)
    http_req_duration: ['p95<200'],  // El 95% de las peticiones debe responder en menos de 200ms (Baja latencia)
    http_req_duration: ['p99<400'],  // El 99% de las peticiones debe responder en menos de 400ms (Picos tolerados)
  },
};

// 2. Setup Phase: Se ejecuta UNA sola vez al inicio del test para autenticarse y preparar datos
export function setup() {
  const loginUrl = 'http://localhost:3000/auth/login';
  const payload = JSON.stringify({
    nombre_usuario: 'TEST_2_USER',
    password: 'TEST_1_PASSWORD',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(loginUrl, payload, params);
  
  // Validar login exitoso y extraer el token JWT
  const token = loginRes.json('token');
  if (!token) {
    throw new Error('❌ Falló la autenticación en el Setup de k6. Verifique credenciales y estado del servidor.');
  }

  console.log('✅ Autenticación de k6 exitosa. Iniciando prueba de carga...');

  // Retornamos el token JWT y un ID de alerta válido (del seed de desarrollo)
  return {
    token: token,
    alertaId: 'alerta_1', // Alerta existente cargada en el seed.ts del backend
  };
}

// 3. Virtual User (VU) Execution: Bucle principal ejecutado por cada usuario concurrente
export default function (data) {
  const url = `http://localhost:3000/respuestas_alertas/${data.alertaId}/asistencias/count`;

  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  // Realizar la petición GET al endpoint de conteo de asistencia RUBA
  const res = http.get(url, params);

  // Verificaciones en tiempo real
  const success = check(res, {
    'status es 200': (r) => r.status === 200,
    'retorna cantidad': (r) => r.json().hasOwnProperty('cantidad'),
    'cantidad es número': (r) => typeof r.json('cantidad') === 'number',
  });

  // Pequeña pausa realista entre iteraciones de cada bombero/operador en la app móvil (ej: 200ms a 500ms)
  sleep(0.3);
}
