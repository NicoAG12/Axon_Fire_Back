import 'dotenv/config';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
const jwt = require('jsonwebtoken');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const usuario = await prisma.usuarios.findFirst({ where: { rol: 'ADMIN' } });
  if (!usuario) {
    console.log("No ADMIN user found");
    return;
  }
  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET || 'JSONWEBTOKENSECRETCODE',
    { expiresIn: '1h' }
  );
  console.log(token);
}

main().catch(console.error).finally(() => prisma.$disconnect());
