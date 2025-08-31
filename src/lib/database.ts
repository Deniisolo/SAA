import { PrismaClient } from '../generated/prisma';

// Configuración global para Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Crear instancia de Prisma Client
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// En desarrollo, guardar la instancia globalmente para evitar múltiples conexiones
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Función para conectar a la base de datos
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a MySQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
    throw error;
  }
}

// Función para desconectar de la base de datos
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Conexión a MySQL cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al desconectar de MySQL:', error);
  }
}

// Función para verificar el estado de la conexión
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'connected', message: 'Base de datos conectada' };
  } catch (error) {
    return { status: 'error', message: 'Error de conexión a la base de datos' };
  }
}
