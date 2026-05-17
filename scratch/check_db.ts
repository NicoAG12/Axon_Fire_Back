import { prisma } from '../src/lib/prisma';

async function main() {
  const subcats = await prisma.subcategoria_alerta.findMany();
  console.log('Subcategorias:', JSON.stringify(subcats, null, 2));
  const categories = await prisma.categorias_alerta.findMany();
  console.log('Categorias:', JSON.stringify(categories, null, 2));
  const states = await prisma.estados_alerta.findMany();
  console.log('Estados:', JSON.stringify(states, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
