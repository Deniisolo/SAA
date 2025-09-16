#!/usr/bin/env node

/**
 * Script para corregir datos faltantes en la base de datos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixMissingData() {
  try {
    console.log('🔧 Corrigiendo datos faltantes en la base de datos...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Crear género Femenino si no existe
    const generoFemenino = await prisma.genero.findFirst({
      where: { descripcion: 'Femenino' }
    })
    
    if (!generoFemenino) {
      await prisma.genero.create({
        data: { descripcion: 'Femenino' }
      })
      console.log('✅ Género Femenino creado')
    } else {
      console.log('ℹ️  Género Femenino ya existe')
    }
    
    // Crear rol Aprendiz si no existe
    const rolAprendiz = await prisma.rol.findFirst({
      where: { nombre_rol: 'Aprendiz' }
    })
    
    if (!rolAprendiz) {
      await prisma.rol.create({
        data: { nombre_rol: 'Aprendiz' }
      })
      console.log('✅ Rol Aprendiz creado')
    } else {
      console.log('ℹ️  Rol Aprendiz ya existe')
    }
    
    // Crear nivel TÉCNICO si no existe
    const nivelTecnico = await prisma.nivelFormacion.findFirst({
      where: { Id_Nivel_de_formacioncol: 'TÉCNICO' }
    })
    
    if (!nivelTecnico) {
      await prisma.nivelFormacion.create({
        data: { Id_Nivel_de_formacioncol: 'TÉCNICO' }
      })
      console.log('✅ Nivel TÉCNICO creado')
    } else {
      console.log('ℹ️  Nivel TÉCNICO ya existe')
    }
    
    // Crear tipos de documento adicionales si no existen
    const tiposDocumento = [
      { id: 2, nombre: 'Tarjeta de Identidad', codigo: 'TI' },
      { id: 3, nombre: 'Cédula de Extranjería', codigo: 'CE' },
      { id: 4, nombre: 'Pasaporte', codigo: 'PAS' }
    ]
    
    for (const tipo of tiposDocumento) {
      const tipoExistente = await prisma.tipoDocumento.findFirst({
        where: { nombre_documento: tipo.nombre }
      })
      
      if (!tipoExistente) {
        await prisma.tipoDocumento.create({
          data: {
            nombre_documento: tipo.nombre,
            TipoDocumentocol: tipo.codigo
          }
        })
        console.log(`✅ Tipo de documento ${tipo.nombre} creado`)
      } else {
        console.log(`ℹ️  Tipo de documento ${tipo.nombre} ya existe`)
      }
    }
    
    // Mostrar resumen final
    console.log('\n📋 Resumen de datos:')
    
    const generos = await prisma.genero.findMany()
    console.log('Géneros:', generos.map(g => `${g.id_genero}: ${g.descripcion}`).join(', '))
    
    const roles = await prisma.rol.findMany()
    console.log('Roles:', roles.map(r => `${r.id_Rol}: ${r.nombre_rol}`).join(', '))
    
    const niveles = await prisma.nivelFormacion.findMany()
    console.log('Niveles:', niveles.map(n => n.Id_Nivel_de_formacioncol).join(', '))
    
    const tipos = await prisma.tipoDocumento.findMany()
    console.log('Tipos de documento:', tipos.map(t => `${t.id_Tipo_Documento}: ${t.nombre_documento}`).join(', '))
    
    console.log('\n🎉 ¡Datos faltantes corregidos exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  fixMissingData()
}
