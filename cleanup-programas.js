#!/usr/bin/env node

/**
 * Script para limpiar programas duplicados y crear solo programas únicos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupProgramas() {
  try {
    console.log('🧹 Limpiando programas duplicados...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Eliminar todos los programas existentes
    await prisma.programaFormacion.deleteMany({})
    console.log('🗑️  Programas existentes eliminados')
    
    // Crear solo programas únicos
    const programasUnicos = [
      // Técnicos
      { nombre: 'Técnico en Programación', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Sistemas', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Redes', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Soporte TI', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Desarrollo Web', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Administración', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Contabilidad', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Recursos Humanos', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Mercadeo', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Logística', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Electrónica', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Mecánica', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Electricidad', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Construcción', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Diseño Gráfico', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Gastronomía', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Enfermería', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Seguridad', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Turismo', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Deportes', nivel: 'TÉCNICO' },
      
      // Tecnólogos
      { nombre: 'Tecnólogo en Análisis de Sistemas', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Redes de Datos', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Desarrollo Software', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Sistemas Información', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Gestión Empresarial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Contaduría', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Talento Humano', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Mercadotecnia', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Logística', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Electrónica Industrial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Mecánica Automotriz', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Electricidad Industrial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Construcciones Civiles', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Diseño Visual', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Gestión Ambiental', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Gastronomía', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Enfermería', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Seguridad Industrial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Turismo', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Deportes', nivel: 'TECNÓLOGO' },
      
      // Especializaciones
      { nombre: 'Especialización en Ciberseguridad', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en IA', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Cloud Computing', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en DevOps', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Desarrollo Móvil', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Big Data', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Blockchain', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en IoT', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Machine Learning', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Videojuegos', nivel: 'ESPECIALIZACIÓN' }
    ]
    
    // Crear todos los programas únicos
    for (const programa of programasUnicos) {
      await prisma.programaFormacion.create({
        data: {
          nombre_programa: programa.nombre,
          nivel_formacion: programa.nivel
        }
      })
      console.log(`✅ Programa "${programa.nombre}" creado`)
    }
    
    // Mostrar resumen final
    const totalProgramas = await prisma.programaFormacion.count()
    console.log(`\n📊 Total de programas únicos: ${totalProgramas}`)
    
    // Mostrar programas por nivel
    const programas = await prisma.programaFormacion.findMany({
      orderBy: [
        { nivel_formacion: 'asc' },
        { nombre_programa: 'asc' }
      ]
    })
    
    console.log('\n📋 Programas de formación únicos:')
    const agrupados = programas.reduce((acc, programa) => {
      const nivel = programa.nivel_formacion
      if (!acc[nivel]) acc[nivel] = []
      acc[nivel].push(programa.nombre_programa)
      return acc
    }, {})
    
    Object.entries(agrupados).forEach(([nivel, programas]) => {
      console.log(`\n🎓 ${nivel} (${programas.length} programas):`)
      programas.forEach(programa => {
        console.log(`   - ${programa}`)
      })
    })
    
    console.log('\n🎉 ¡Programas únicos creados exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  cleanupProgramas()
}
