import request from 'supertest';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-12: Backend Test - Límites de Carga y Subida de Imágenes', () => {

  it('Debería procesar correctamente payloads normales pequeños (bajo el límite predeterminado de 100KB)', async () => {
    const res = await request(baseUrl)
      .post('/auth/login')
      .send({
        nombre_usuario: 'usuario_pequeno',
        password: 'a'.repeat(1000) // 1KB de payload
      });

    expect(res.status).not.toBe(413);
  });

  it('ROJO - Debería fallar con 413 Payload Too Large al intentar subir una imagen pesada (ej: 1.5MB) debido al límite default de Express de 100KB', async () => {
    const simulatedBase64Image = 'b'.repeat(1.5 * 1024 * 1024);

    const res = await request(baseUrl)
      .post('/auth/login') // Cualquier endpoint que use express.json()
      .send({
        nombre_usuario: 'test_heavy_upload',
        image: simulatedBase64Image
      });

    // Límite default de 100KB sin configurar: Express rechaza con 413
    expect(res.status).toBe(413);
  });
});
