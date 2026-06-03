import http from 'k6/http';
import { check, sleep } from 'k6';

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

export function setup() {
  const loginUrl = 'http://localhost:3000/auth/login';
  const payload = JSON.stringify({
    nombre_usuario: 'TEST_1_ADMIN',
    password: 'TEST_1_PASSWORD',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const loginRes = http.post(loginUrl, payload, params);

  const token = loginRes.json('token');
  if (!token) {
    throw new Error('Falló autenticación admin en Setup de k6');
  }

  console.log('Autenticación admin exitosa. Iniciando stress test de metricas...');

  return {
    token: token,
  };
}

export default function (data) {
  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();

  const url = `http://localhost:3000/metricas/mensuales?mes=${mes}&anio=${anio}`;

  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(url, params);

  const success = check(res, {
    'status es 200': (r) => r.status === 200,
    'retorna total_emergencias': (r) => r.json().hasOwnProperty('total_emergencias'),
    'retorna bomberos': (r) => r.json().hasOwnProperty('bomberos'),
    'bomberos es array': (r) => Array.isArray(r.json('bomberos')),
  });

  sleep(0.3);
}
