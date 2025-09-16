#!/usr/bin/env node

/**
 * Script para configurar la base de datos en Render
 * Ejecutar después de crear la base de datos PostgreSQL en Render
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🚀 Configurando base de datos en Render...')
    
    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos establecida')
    
    // Crear datos iniciales si no existen
    console.log('📊 Verificando datos iniciales...')
    
    // Verificar si ya existen datos
    const usuariosCount = await prisma.usuario.count()
    const competenciasCount = await prisma.competencia.count()
    
    if (usuariosCount === 0) {
      console.log('👥 Creando usuarios de prueba...')
      
      // Crear tipos de documento
      const tipoDocumento = await prisma.tipoDocumento.create({
        data: {
          nombre_documento: 'Cédula de Ciudadanía',
          TipoDocumentocol: 'CC'
        }
      })
      
      // Crear roles
      const rolInstructor = await prisma.rol.create({
        data: {
          nombre_rol: 'Instructor'
        }
      })
      
      const rolCoordinador = await prisma.rol.create({
        data: {
          nombre_rol: 'Coordinador'
        }
      })
      
      // Crear estado estudiante
      const estadoEstudiante = await prisma.estadoEstudiante.create({
        data: {
          descripcion_estado: 'Activo'
        }
      })
      
      // Crear género
      const genero = await prisma.genero.create({
        data: {
          descripcion: 'Masculino'
        }
      })
      
      // Crear programa de formación
      const programaFormacion = await prisma.programaFormacion.create({
        data: {
          nombre_programa: 'Tecnología en Sistemas',
          nivel_formacion: 'Tecnólogo'
        }
      })
      
      // Crear nivel de formación
      const nivelFormacion = await prisma.nivelFormacion.create({
        data: {
          Id_Nivel_de_formacioncol: 'Tecnólogo'
        }
      })
      
      // Crear ficha
      const ficha = await prisma.ficha.create({
        data: {
          numero_ficha: '2556678',
          id_programa_formacion: programaFormacion.idPrograma_formacion
        }
      })
      
      // Crear usuarios de prueba
      await prisma.usuario.createMany({
        data: [
          {
            nombre: 'Fabian',
            apellido: 'Hernandez',
            correo_electronico: 'instructor@saa.com',
            telefono: '3001234567',
            numero_documento: '12345678',
            usemame: 'instructor',
            Contrasenia: '123456',
            codigo_qr: 'SAA-INSTRUCTOR-001',
            Rol_id_Rol: rolInstructor.id_Rol,
            TipoDocumento_id_Tipo_Documento: tipoDocumento.id_Tipo_Documento,
            EstadoEstudiante_id_estado_estudiante: estadoEstudiante.id_estado_estudiante,
            Ficha_id_ficha: ficha.id_ficha,
            Genero_id_genero: genero.id_genero,
            Programa_formacion_idPrograma_formacion: programaFormacion.idPrograma_formacion,
            Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelFormacion.Id_Nivel_de_formacioncol
          },
          {
            nombre: 'María',
            apellido: 'García',
            correo_electronico: 'coordinador@saa.com',
            telefono: '3007654321',
            numero_documento: '87654321',
            usemame: 'coordinador',
            Contrasenia: '123456',
            codigo_qr: 'SAA-COORDINADOR-001',
            Rol_id_Rol: rolCoordinador.id_Rol,
            TipoDocumento_id_Tipo_Documento: tipoDocumento.id_Tipo_Documento,
            EstadoEstudiante_id_estado_estudiante: estadoEstudiante.id_estado_estudiante,
            Ficha_id_ficha: ficha.id_ficha,
            Genero_id_genero: genero.id_genero,
            Programa_formacion_idPrograma_formacion: programaFormacion.idPrograma_formacion,
            Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelFormacion.Id_Nivel_de_formacioncol
          }
        ]
      })
      
      console.log('✅ Usuarios de prueba creados')
    } else {
      console.log('ℹ️  Los usuarios ya existen, saltando creación...')
    }
    
    if (competenciasCount === 0) {
      console.log('📚 Creando competencias de prueba...')
      
      // Crear competencias
      await prisma.competencia.createMany({
        data: [
          {
            nombre_competencia: 'Desarrollo de Software',
            descripcion: 'Competencia para desarrollar aplicaciones de software',
            codigo_competencia: '240201500'
          },
          {
            nombre_competencia: 'Bases de Datos',
            descripcion: 'Competencia para diseñar y administrar bases de datos',
            codigo_competencia: '240201501'
          },
          {
            nombre_competencia: 'Redes de Computadores',
            descripcion: 'Competencia para configurar redes de computadores',
            codigo_competencia: '240201502'
          }
        ]
      })
      
      console.log('✅ Competencias de prueba creadas')
    } else {
      console.log('ℹ️  Las competencias ya existen, saltando creación...')
    }
    
    console.log('🎉 Base de datos configurada exitosamente en Render!')
    console.log('📋 Credenciales de prueba:')
    console.log('   - Instructor: usuario: instructor, contraseña: 123456')
    console.log('   - Coordinador: usuario: coordinador, contraseña: 123456')
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }
