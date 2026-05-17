import { PrismaClient } from './generated/client';
const prisma = new PrismaClient();
async function test() {
    try {
        const estadoFinalizado = await prisma.estados_alerta.findUnique({ where: { nombre_estado: 'FINALIZADO' } })
        console.log(estadoFinalizado);
    } catch(e) {
        console.log(e);
    }
}
test().finally(() => prisma.$disconnect());
