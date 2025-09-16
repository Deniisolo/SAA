#!/usr/bin/env node

/**
 * Script para limpiar roles duplicados
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupRoles() {
  try {
    console.log('🧹 Limpiando roles duplicados...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Eliminar roles antiguos que no se usan
    const rolesAntiguos = await prisma.rol.findMany({
      where: {
        nombre_rol: {
          in: ['Instructor', 'Coordinador']
        }
      }
    })
    
    if (rolesAntiguos.length > 0) {
      console.log(`🗑️  Eliminando ${rolesAntiguos.length} roles antiguos...`)
      await prisma.rol.deleteMany({
        where: {
          nombre_rol: {
            in: ['Instructor', 'Coordinador']
          }
        }
      })
      console.log('✅ Roles antiguos eliminados')
    }
    
    // Mostrar roles finales
    const rolesFinales = await prisma.rol.findMany()
    console.log('\n📋 Roles finales:')
    rolesFinales.forEach(rol => {
      console.log(`   - ${rol.nombre_rol} (ID: ${rol.id_Rol})`)
    })
    
    // Mostrar usuarios
    const usuarios = await prisma.usuario.findMany({
      include: { rol: true }
    })
    
    console.log('\n👥 Usuarios:')
    usuarios.forEach(usuario => {
      console.log(`   - ${usuario.usemame} (${usuario.nombre} ${usuario.apellido}) - Rol: ${usuario.rol.nombre_rol}`)
    })
    
    console.log('\n🎉 ¡Limpieza completada!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  cleanupRoles()
}
