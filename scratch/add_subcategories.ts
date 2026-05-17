import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

async function main() {
  const sumSub = await prisma.subcategoria_alerta.upsert({
    where: { nombre_sub_categoria: 'PEDIDO DE SUMINISTROS' },
    update: {},
    create: {
      id: '4', // Let's use '4' for simplicity if '1','2','3' are used
      categoria_alerta_id: '3',
      nombre_sub_categoria: 'PEDIDO DE SUMINISTROS'
    }
  });
  console.log('Created subcategory:', sumSub);

  const persSub = await prisma.subcategoria_alerta.upsert({
    where: { nombre_sub_categoria: 'PEDIDO DE PERSONAL' },
    update: {},
    create: {
      id: '5',
      categoria_alerta_id: '3',
      nombre_sub_categoria: 'PEDIDO DE PERSONAL'
    }
  });
  console.log('Created subcategory:', persSub);
}

main().catch(console.error).finally(() => prisma.$disconnect());
