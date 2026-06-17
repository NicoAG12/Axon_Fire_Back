import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Configuración del perfil de carga (Ramp-up, Sustain, Ramp-down) y umbrales de SLA
export const options = {
  stages: [
    { duration: '5s', target: 20 },
    { duration: '15s', target: 20 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p95<200'],
    http_req_duration: ['p99<400'],
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

  const token = loginRes.json('token');
  if (!token) {
    throw new Error('Falló la autenticación en el Setup de k6. Verifique credenciales y estado del servidor.');
  }

  console.log('Autenticación de k6 exitosa. Iniciando prueba de carga');

  return {
    token: token,
    alertaId: 'alerta_1',
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

  const res = http.get(url, params);

  const success = check(res, {
    'status es 200': (r) => r.status === 200,
    'retorna cantidad': (r) => r.json().hasOwnProperty('cantidad'),
    'cantidad es número': (r) => typeof r.json('cantidad') === 'number',
  });

  sleep(0.3);
}
