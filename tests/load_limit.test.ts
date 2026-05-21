import request from 'supertest';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-12: Backend Test - Límites de Carga y Subida de Imágenes', () => {
  
  it('Debería procesar correctamente payloads normales pequeños (bajo el límite predeterminado de 100KB)', async () => {
    // Enviamos una petición normal a un endpoint (ej: login con datos incorrectos)
    // El servidor debería procesar el body de forma habitual y retornar un error lógico de negocio (ej: 500 o 400),
    // pero NO un error 413 (Payload Too Large).
    const res = await request(baseUrl)
      .post('/auth/login')
      .send({
        nombre_usuario: 'usuario_pequeno',
        password: 'a'.repeat(1000) // 1KB de payload
      });

    expect(res.status).not.toBe(413);
  });

  it('ROJO - Debería fallar con 413 Payload Too Large al intentar subir una imagen pesada (ej: 1.5MB) debido al límite default de Express de 100KB', async () => {
    // Generar un string que simula una imagen pesada en base64 de aproximadamente 1.5 MB
    // (1.5 * 1024 * 1024 caracteres)
    const simulatedBase64Image = 'b'.repeat(1.5 * 1024 * 1024);

    const res = await request(baseUrl)
      .post('/auth/login') // Cualquier endpoint que use express.json()
      .send({
        nombre_usuario: 'test_heavy_upload',
        image: simulatedBase64Image
      });

    // En el estado actual (límite default de 100KB sin configurar):
    // El parser de Express rechazará esto con 413 Payload Too Large.
    // Esto demuestra la LIMITACIÓN actual del backend para soportar subidas de imágenes pesadas.
    expect(res.status).toBe(413);
    
    console.warn(`[LÍMITE DE CARGA DOCUMENTADO]: El servidor rechazó el payload de 1.5MB con status ${res.status}. Actualmente no soporta subida de imágenes pesadas.`);
  });
});
