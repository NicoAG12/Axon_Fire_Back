import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
// Singleton para reutilizar la conexión en toda la app
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

