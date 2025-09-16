#!/usr/bin/env node

/**
 * Script para crear programas de formación con nombres cortos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createProgramasCortos() {
  try {
    console.log('🎓 Creando programas de formación con nombres cortos...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Programas de formación con nombres cortos (máximo 45 caracteres)
    const programasNuevos = [
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
  createProgramasCortos()
}
