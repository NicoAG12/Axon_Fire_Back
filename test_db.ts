import { prisma } from './src/lib/prisma';
async function main() {
  const estados = await prisma.estados_alerta.findMany();
  console.log("ESTADOS:", estados);
}
main().finally(() => prisma.$disconnect());
