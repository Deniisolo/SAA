#!/usr/bin/env node

/**
 * Script para corregir los roles en la base de datos
 * Asegura que los roles coincidan con la lógica del sistema
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixRoles() {
  try {
    console.log('🔧 Corrigiendo roles en la base de datos...')
    
    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos establecida')
    
    // Verificar roles existentes
    const rolesExistentes = await prisma.rol.findMany()
    console.log('📋 Roles existentes:', rolesExistentes.map(r => r.nombre_rol))
    
    // Crear o actualizar rol 'admin'
    let rolAdmin = await prisma.rol.findFirst({
      where: { nombre_rol: 'admin' }
    })
    
    if (!rolAdmin) {
      rolAdmin = await prisma.rol.create({
        data: { nombre_rol: 'admin' }
      })
      console.log('✅ Rol admin creado')
    } else {
      console.log('ℹ️  Rol admin ya existe')
    }
    
    // Crear o actualizar rol 'instructor'
    let rolInstructor = await prisma.rol.findFirst({
      where: { nombre_rol: 'instructor' }
    })
    
    if (!rolInstructor) {
      rolInstructor = await prisma.rol.create({
        data: { nombre_rol: 'instructor' }
      })
      console.log('✅ Rol instructor creado')
    } else {
      console.log('ℹ️  Rol instructor ya existe')
    }
    
    // Actualizar usuarios existentes para usar los roles correctos
    const usuariosInstructor = await prisma.usuario.findMany({
      where: {
        rol: {
          nombre_rol: 'Instructor'
        }
      }
    })
    
    if (usuariosInstructor.length > 0) {
      console.log(`🔄 Actualizando ${usuariosInstructor.length} usuarios de Instructor a instructor...`)
      await prisma.usuario.updateMany({
        where: {
          rol: {
            nombre_rol: 'Instructor'
          }
        },
        data: {
          Rol_id_Rol: rolInstructor.id_Rol
        }
      })
      console.log('✅ Usuarios actualizados a rol instructor')
    }
    
    const usuariosCoordinador = await prisma.usuario.findMany({
      where: {
        rol: {
          nombre_rol: 'Coordinador'
        }
      }
    })
    
    if (usuariosCoordinador.length > 0) {
      console.log(`🔄 Actualizando ${usuariosCoordinador.length} usuarios de Coordinador a admin...`)
      await prisma.usuario.updateMany({
        where: {
          rol: {
            nombre_rol: 'Coordinador'
          }
        },
        data: {
          Rol_id_Rol: rolAdmin.id_Rol
        }
      })
      console.log('✅ Usuarios actualizados a rol admin')
    }
    
    // Mostrar resumen final
    const rolesFinales = await prisma.rol.findMany()
    console.log('\n📋 Roles finales en la base de datos:')
    rolesFinales.forEach(rol => {
      console.log(`   - ${rol.nombre_rol} (ID: ${rol.id_Rol})`)
    })
    
    // Mostrar usuarios por rol
    const usuariosPorRol = await prisma.usuario.findMany({
      include: { rol: true }
    })
    
    console.log('\n👥 Usuarios por rol:')
    const agrupados = usuariosPorRol.reduce((acc, usuario) => {
      const rol = usuario.rol.nombre_rol
      if (!acc[rol]) acc[rol] = []
      acc[rol].push(usuario.usemame)
      return acc
    }, {})
    
    Object.entries(agrupados).forEach(([rol, usuarios]) => {
      console.log(`   ${rol}: ${usuarios.join(', ')}`)
    })
    
    console.log('\n🎉 ¡Roles corregidos exitosamente!')
    
  } catch (error) {
    console.error('❌ Error corrigiendo roles:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixRoles()
}

module.exports = { fixRoles }
