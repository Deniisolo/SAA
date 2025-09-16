#!/usr/bin/env node

/**
 * Script para verificar y corregir los datos de género en la base de datos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkGenderData() {
  try {
    console.log('🔍 Verificando datos de género en la base de datos...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Verificar géneros existentes
    const generos = await prisma.genero.findMany()
    console.log('\n📋 Géneros existentes:')
    generos.forEach(genero => {
      console.log(`   - ID: ${genero.id_genero}, Descripción: ${genero.descripcion}`)
    })
    
    // Verificar tipos de documento
    const tiposDocumento = await prisma.tipoDocumento.findMany()
    console.log('\n📋 Tipos de documento existentes:')
    tiposDocumento.forEach(tipo => {
      console.log(`   - ID: ${tipo.id_Tipo_Documento}, Nombre: ${tipo.nombre_documento}`)
    })
    
    // Verificar estados de estudiante
    const estadosEstudiante = await prisma.estadoEstudiante.findMany()
    console.log('\n📋 Estados de estudiante existentes:')
    estadosEstudiante.forEach(estado => {
      console.log(`   - ID: ${estado.id_estado_estudiante}, Descripción: ${estado.descripcion_estado}`)
    })
    
    // Verificar roles
    const roles = await prisma.rol.findMany()
    console.log('\n📋 Roles existentes:')
    roles.forEach(rol => {
      console.log(`   - ID: ${rol.id_Rol}, Nombre: ${rol.nombre_rol}`)
    })
    
    // Verificar niveles de formación
    const nivelesFormacion = await prisma.nivelFormacion.findMany()
    console.log('\n📋 Niveles de formación existentes:')
    nivelesFormacion.forEach(nivel => {
      console.log(`   - ID: ${nivel.Id_Nivel_de_formacioncol}`)
    })
    
    console.log('\n🎉 Verificación completada!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkGenderData()
}
