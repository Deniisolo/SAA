#!/usr/bin/env node

/**
 * Script para crear usuario admin en la base de datos de Render
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('👑 Creando usuario administrador...')
    
    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos establecida')
    
    // Buscar o crear rol de administrador (debe ser exactamente 'admin')
    let rolAdmin = await prisma.rol.findFirst({
      where: { nombre_rol: 'admin' }
    })
    
    if (!rolAdmin) {
      rolAdmin = await prisma.rol.create({
        data: {
          nombre_rol: 'admin'
        }
      })
      console.log('✅ Rol admin creado')
    } else {
      console.log('ℹ️  Rol admin ya existe')
    }
    
    // Buscar datos necesarios para el usuario
    const tipoDocumento = await prisma.tipoDocumento.findFirst()
    const estadoEstudiante = await prisma.estadoEstudiante.findFirst()
    const genero = await prisma.genero.findFirst()
    const programaFormacion = await prisma.programaFormacion.findFirst()
    const nivelFormacion = await prisma.nivelFormacion.findFirst()
    const ficha = await prisma.ficha.findFirst()
    
    // Verificar si el usuario admin ya existe
    const adminExistente = await prisma.usuario.findFirst({
      where: { usemame: 'admin' }
    })
    
    if (adminExistente) {
      console.log('ℹ️  Usuario admin ya existe, actualizando...')
      
      // Actualizar usuario existente
      const adminActualizado = await prisma.usuario.update({
        where: { id_usuario: adminExistente.id_usuario },
        data: {
          nombre: 'Administrador',
          apellido: 'Sistema',
          correo_electronico: 'admin@saa.com',
          telefono: '3000000000',
          numero_documento: '00000000',
          usemame: 'admin',
          Contrasenia: 'admin123',
          codigo_qr: 'SAA-ADMIN-001',
          Rol_id_Rol: rolAdmin.id_Rol,
          TipoDocumento_id_Tipo_Documento: tipoDocumento.id_Tipo_Documento,
          EstadoEstudiante_id_estado_estudiante: estadoEstudiante.id_estado_estudiante,
          Ficha_id_ficha: ficha.id_ficha,
          Genero_id_genero: genero.id_genero,
          Programa_formacion_idPrograma_formacion: programaFormacion.idPrograma_formacion,
          Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelFormacion.Id_Nivel_de_formacioncol
        }
      })
      
      console.log('✅ Usuario admin actualizado')
      console.log('👑 Credenciales del Administrador:')
      console.log('   📧 Usuario: admin')
      console.log('   🔑 Contraseña: admin123')
      console.log('   🏷️  Código QR: SAA-ADMIN-001')
      console.log('   📧 Email: admin@saa.com')
      
    } else {
      // Crear nuevo usuario admin
      const admin = await prisma.usuario.create({
        data: {
          nombre: 'Administrador',
          apellido: 'Sistema',
          correo_electronico: 'admin@saa.com',
          telefono: '3000000000',
          numero_documento: '00000000',
          usemame: 'admin',
          Contrasenia: 'admin123',
          codigo_qr: 'SAA-ADMIN-001',
          Rol_id_Rol: rolAdmin.id_Rol,
          TipoDocumento_id_Tipo_Documento: tipoDocumento.id_Tipo_Documento,
          EstadoEstudiante_id_estado_estudiante: estadoEstudiante.id_estado_estudiante,
          Ficha_id_ficha: ficha.id_ficha,
          Genero_id_genero: genero.id_genero,
          Programa_formacion_idPrograma_formacion: programaFormacion.idPrograma_formacion,
          Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelFormacion.Id_Nivel_de_formacioncol
        }
      })
      
      console.log('✅ Usuario admin creado exitosamente')
      console.log('👑 Credenciales del Administrador:')
      console.log('   📧 Usuario: admin')
      console.log('   🔑 Contraseña: admin123')
      console.log('   🏷️  Código QR: SAA-ADMIN-001')
      console.log('   📧 Email: admin@saa.com')
    }
    
    // Mostrar información del usuario admin
    const adminInfo = await prisma.usuario.findFirst({
      where: { usemame: 'admin' },
      include: {
        rol: true
      }
    })
    
    console.log('\n📋 Información del Usuario Admin:')
    console.log(`   🆔 ID: ${adminInfo.id_usuario}`)
    console.log(`   👤 Nombre: ${adminInfo.nombre} ${adminInfo.apellido}`)
    console.log(`   🎭 Rol: ${adminInfo.rol.nombre_rol}`)
    console.log(`   📧 Email: ${adminInfo.correo_electronico}`)
    console.log(`   📱 Teléfono: ${adminInfo.telefono}`)
    console.log(`   🆔 Documento: ${adminInfo.numero_documento}`)
    console.log(`   🏷️  Código QR: ${adminInfo.codigo_qr}`)
    
    console.log('\n🎉 ¡Usuario administrador configurado exitosamente!')
    
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdmin()
}

module.exports = { createAdmin }
