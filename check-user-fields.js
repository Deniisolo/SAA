#!/usr/bin/env node

/**
 * Script para verificar los campos del usuario
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserFields() {
  try {
    console.log('👤 Verificando campos de usuario...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Buscar un usuario admin
    const adminUser = await prisma.usuario.findFirst({
      where: {
        rol: {
          nombre_rol: 'admin'
        }
      },
      include: {
        rol: true
      }
    })
    
    if (!adminUser) {
      console.log('❌ No se encontró usuario admin')
      return
    }
    
    console.log('📋 Campos del usuario admin:')
    console.log(JSON.stringify(adminUser, null, 2))
    
    // Buscar todos los usuarios para ver la estructura
    const allUsers = await prisma.usuario.findMany({
      take: 3,
      include: {
        rol: true
      }
    })
    
    console.log('\n📋 Primeros 3 usuarios:')
    allUsers.forEach((user, index) => {
      console.log(`\nUsuario ${index + 1}:`)
      console.log(`  - ID: ${user.id_usuario}`)
      console.log(`  - Nombre: ${user.nombre}`)
      console.log(`  - Apellido: ${user.apellido}`)
      console.log(`  - Usuario: ${user.usuario}`)
      console.log(`  - Email: ${user.email}`)
      console.log(`  - Rol: ${user.rol?.nombre_rol}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkUserFields()
}
