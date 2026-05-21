import request from 'supertest';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('Seguridad - Checklist Cuartel (AX-13)', () => {
  let tokenUser2: string;
  const user2Id = 'abc2'; // TEST_2_USER
  const spoofedUserId = 'abc3'; // TEST_3_USER (El ID que queremos falsificar)

  beforeAll(async () => {
    // 1. Iniciar sesión como TEST_2_USER para obtener un token JWT legítimo
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({
        nombre_usuario: 'TEST_2_USER',
        password: 'TEST_1_PASSWORD'
      });

    expect(loginRes.status).toBe(200);
    tokenUser2 = loginRes.body.token;
    expect(tokenUser2).toBeDefined();
  });

  it('ROJO - Debería permitir guardar un checklist asignado a otro usuario (ID falsificado en el body) debido a la vulnerabilidad de Broken Access Control', async () => {
    // 2. Intentar guardar el checklist del cuartel usando el token del Usuario 2, 
    // pero falsificando el usuarioId en el body para que se asigne al Usuario 3.
    const checklistPayload = {
      usuarioId: spoofedUserId, // Falsificación: mandamos el ID de otro usuario
      detalles: [
        {
          herramientaId: 'herr_1',
          controlado: 'CHEQUEADO'
        }
      ]
    };

    const res = await request(baseUrl)
      .post('/checklist_cuartel')
      .set('Authorization', `Bearer ${tokenUser2}`)
      .send(checklistPayload);

    // En el estado vulnerable actual (ROJO), esto debería completarse con 201 Created
    // y guardar el registro asignado a 'abc3' (Usuario 3) en vez de al dueño del token ('abc2')
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.usuario_id).toBe(spoofedUserId); // Comprobamos que el ID guardado es el falsificado
    
    // Documentamos la vulnerabilidad en consola para el reporte de QA
    console.warn(`[VULNERABILIDAD DOCUMENTADA]: Se creó un checklist con usuarioId spoofed (${res.body.usuario_id}) usando un token perteneciente a ${user2Id}`);
  });
});
