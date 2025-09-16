#!/usr/bin/env node

/**
 * Script para agregar solo programas únicos sin duplicados
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addUniqueProgramas() {
  try {
    console.log('🎓 Agregando programas únicos...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Programas únicos que queremos asegurar que existan
    const programasDeseados = [
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
    
    let programasCreados = 0
    let programasExistentes = 0
    
    for (const programa of programasDeseados) {
      // Verificar si el programa ya existe
      const programaExistente = await prisma.programaFormacion.findFirst({
        where: { 
          nombre_programa: programa.nombre,
          nivel_formacion: programa.nivel
        }
      })
      
      if (programaExistente) {
        console.log(`ℹ️  Programa "${programa.nombre}" ya existe`)
        programasExistentes++
      } else {
        // Crear nuevo programa
        await prisma.programaFormacion.create({
          data: {
            nombre_programa: programa.nombre,
            nivel_formacion: programa.nivel
          }
        })
        console.log(`✅ Programa "${programa.nombre}" creado`)
        programasCreados++
      }
    }
    
    // Mostrar resumen
    console.log('\n📊 Resumen:')
    console.log(`   - Programas creados: ${programasCreados}`)
    console.log(`   - Programas existentes: ${programasExistentes}`)
    console.log(`   - Total procesados: ${programasDeseados.length}`)
    
    // Mostrar total de programas únicos
    const totalProgramas = await prisma.programaFormacion.count()
    console.log(`\n📋 Total de programas en la base de datos: ${totalProgramas}`)
    
    // Mostrar algunos ejemplos
    const ejemplos = await prisma.programaFormacion.findMany({
      take: 10,
      orderBy: { nombre_programa: 'asc' }
    })
    
    console.log('\n📝 Ejemplos de programas disponibles:')
    ejemplos.forEach(programa => {
      console.log(`   - ${programa.nombre_programa} (${programa.nivel_formacion})`)
    })
    
    console.log('\n🎉 ¡Programas únicos agregados exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  addUniqueProgramas()
}
