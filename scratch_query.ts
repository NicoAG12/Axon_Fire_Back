import 'dotenv/config';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const alerta = await prisma.alerta.findFirst();
  const usuario = await prisma.usuarios.findFirst({ where: { rol: 'USER' } });
  
  if (!alerta || !usuario) {
    console.log("No hay alertas o usuarios");
    return;
  }
  
  let respuesta = await prisma.respuestas_alertas.findFirst({
    where: { alerta_id: alerta.id, usuario_id: usuario.id }
  });
  
  if (!respuesta) {
    respuesta = await prisma.respuestas_alertas.create({
      data: {
        alerta_id: alerta.id,
        usuario_id: usuario.id,
        estado_respuesta: 'PENDIENTE',
        fecha_hora: new Date()
      }
    });
  }

  // Get a token for this user
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET || 'JSONWEBTOKENSECRETCODE',
    { expiresIn: '1h' }
  );

  console.log(JSON.stringify({
    alerta_id: alerta.id,
    usuario_id: usuario.id,
    respuesta_id: respuesta.id,
    token: token
  }));
}

main().catch(console.error).finally(() => prisma.$disconnect());
