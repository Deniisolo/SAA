const { PrismaClient } = require('@prisma/client')

// Reemplaza esta URL con la que obtengas de Railway
const DATABASE_URL = "mysql://root:password@containers-us-west-xxx.railway.app:xxxx/railway"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a Railway...')
    
    // Probar conexión
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Railway!')
    
    // Probar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Consulta de prueba exitosa:', result)
    
    console.log('🎉 Railway está listo para usar!')
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    console.log('\n📋 Verifica:')
    console.log('1. Que la URL de conexión sea correcta')
    console.log('2. Que la base de datos esté activa en Railway')
    console.log('3. Que no haya problemas de red')
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
