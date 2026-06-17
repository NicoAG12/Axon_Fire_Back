import request from 'supertest';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('Seguridad - Checklist Cuartel (AX-13)', () => {
  let tokenUser2: string;
  const user2Id = 'abc2'; // TEST_2_USER
  const spoofedUserId = 'abc3'; // TEST_3_USER (El ID que queremos falsificar)

  beforeAll(async () => {
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
    // Intentar guardar el checklist con token del User 2 pero falsificando usuarioId al User 3
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

    // En el estado vulnerable (ROJO), se completa con 201 y guarda el registro con el ID falsificado
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.usuario_id).toBe(spoofedUserId); // El ID guardado es el falsificado, no el del token
  });
});
