#!/usr/bin/env node

/**
 * Script para crear más programas de formación únicos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMoreProgramas() {
  try {
    console.log('🎓 Creando más programas de formación...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Programas de formación únicos
    const programasNuevos = [
      // Técnicos
      { nombre: 'Técnico en Programación de Software', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Sistemas de Información', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Redes de Computadores', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Soporte y Mantenimiento de Computadores', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Desarrollo de Aplicaciones Web', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Administración de Empresas', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Contabilidad y Finanzas', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Gestión de Recursos Humanos', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Mercadeo y Ventas', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Logística y Distribución', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Electrónica', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Mecánica Industrial', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Electricidad', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Construcción', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Diseño Gráfico', nivel: 'TÉCNICO' },
      
      // Tecnólogos
      { nombre: 'Tecnólogo en Análisis y Desarrollo de Sistemas', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Gestión de Redes de Datos', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Desarrollo de Software', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Sistemas de Información', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Gestión Empresarial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Contaduría Pública', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Gestión de Talento Humano', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Mercadotecnia', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Logística Internacional', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Electrónica Industrial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Mecánica Automotriz', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Electricidad Industrial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Construcciones Civiles', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Diseño y Comunicación Visual', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Gestión Ambiental', nivel: 'TECNÓLOGO' },
      
      // Especializaciones
      { nombre: 'Especialización en Ciberseguridad', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Inteligencia Artificial', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Cloud Computing', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en DevOps', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Desarrollo Móvil', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Big Data', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Blockchain', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en IoT (Internet de las Cosas)', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Machine Learning', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Desarrollo de Videojuegos', nivel: 'ESPECIALIZACIÓN' }
    ]
    
    let programasCreados = 0
    let programasExistentes = 0
    
    for (const programa of programasNuevos) {
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
    console.log(`   - Total procesados: ${programasNuevos.length}`)
    
    // Mostrar todos los programas por nivel
    const todosLosProgramas = await prisma.programaFormacion.findMany({
      orderBy: [
        { nivel_formacion: 'asc' },
        { nombre_programa: 'asc' }
      ]
    })
    
    console.log('\n📋 Todos los programas de formación:')
    const agrupados = todosLosProgramas.reduce((acc, programa) => {
      const nivel = programa.nivel_formacion
      if (!acc[nivel]) acc[nivel] = []
      acc[nivel].push(programa.nombre_programa)
      return acc
    }, {})
    
    Object.entries(agrupados).forEach(([nivel, programas]) => {
      console.log(`\n🎓 ${nivel}:`)
      programas.forEach(programa => {
        console.log(`   - ${programa}`)
      })
    })
    
    console.log('\n🎉 ¡Programas de formación creados exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createMoreProgramas()
}
