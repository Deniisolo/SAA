#!/usr/bin/env node

/**
 * Script para crear programas específicos del SENA
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSenaProgramas() {
  try {
    console.log('🎓 Creando programas específicos del SENA...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Eliminar todos los programas existentes (excepto los que tienen fichas asociadas)
    // Primero vamos a ver cuáles tienen fichas
    const programasConFichas = await prisma.ficha.findMany({
      select: { id_programa_formacion: true },
      distinct: ['id_programa_formacion']
    })
    
    const idsConFichas = programasConFichas.map(f => f.id_programa_formacion)
    
    // Eliminar solo los programas que NO tienen fichas
    const programasAEliminar = await prisma.programaFormacion.findMany({
      where: {
        idPrograma_formacion: {
          notIn: idsConFichas
        }
      }
    })
    
    if (programasAEliminar.length > 0) {
      await prisma.programaFormacion.deleteMany({
        where: {
          idPrograma_formacion: {
            notIn: idsConFichas
          }
        }
      })
      console.log(`🗑️  ${programasAEliminar.length} programas sin fichas eliminados`)
    }
    
    // Programas específicos del SENA
    const programasSena = [
      // Técnicos SENA
      { nombre: 'Técnico en Sistemas', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Programación de Software', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Redes de Computadores', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Soporte y Mantenimiento', nivel: 'TÉCNICO' },
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
      { nombre: 'Técnico en Gastronomía', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Enfermería', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Seguridad Ocupacional', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Turismo', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Deportes', nivel: 'TÉCNICO' },
      
      // Tecnólogos SENA
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
      { nombre: 'Tecnólogo en Gastronomía', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Enfermería', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Seguridad Industrial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Turismo', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Deportes', nivel: 'TECNÓLOGO' },
      
      // Programas de Química (5 como solicitaste)
      { nombre: 'Técnico en Química Industrial', nivel: 'TÉCNICO' },
      { nombre: 'Técnico en Análisis Químico', nivel: 'TÉCNICO' },
      { nombre: 'Tecnólogo en Química Industrial', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Análisis Químico', nivel: 'TECNÓLOGO' },
      { nombre: 'Tecnólogo en Procesos Químicos', nivel: 'TECNÓLOGO' },
      
      // Especializaciones SENA
      { nombre: 'Especialización en Ciberseguridad', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Inteligencia Artificial', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Cloud Computing', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en DevOps', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Desarrollo Móvil', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Big Data', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Blockchain', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en IoT', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Machine Learning', nivel: 'ESPECIALIZACIÓN' },
      { nombre: 'Especialización en Desarrollo de Videojuegos', nivel: 'ESPECIALIZACIÓN' }
    ]
    
    let programasCreados = 0
    let programasExistentes = 0
    
    for (const programa of programasSena) {
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
    console.log(`   - Total procesados: ${programasSena.length}`)
    
    // Mostrar total de programas
    const totalProgramas = await prisma.programaFormacion.count()
    console.log(`\n📋 Total de programas SENA: ${totalProgramas}`)
    
    // Mostrar programas de química específicamente
    const programasQuimica = await prisma.programaFormacion.findMany({
      where: {
        nombre_programa: {
          contains: 'Química'
        }
      },
      orderBy: { nombre_programa: 'asc' }
    })
    
    console.log('\n🧪 Programas de Química:')
    programasQuimica.forEach(programa => {
      console.log(`   - ${programa.nombre_programa} (${programa.nivel_formacion})`)
    })
    
    // Mostrar programas por nivel
    const programas = await prisma.programaFormacion.findMany({
      orderBy: [
        { nivel_formacion: 'asc' },
        { nombre_programa: 'asc' }
      ]
    })
    
    console.log('\n📋 Programas SENA por nivel:')
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
    
    console.log('\n🎉 ¡Programas SENA creados exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createSenaProgramas()
}
