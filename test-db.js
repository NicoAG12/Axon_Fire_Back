const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const bomberos = await prisma.bomberos.findMany({
      include: {
        usuarioId: true,
        rangoBombero: true
      }
    });
    console.log('Bomberos count:', bomberos.length);
    if (bomberos.length > 0) {
      console.log('First bombero:', JSON.stringify(bomberos[0], null, 2));
    }
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
