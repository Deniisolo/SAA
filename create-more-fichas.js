#!/usr/bin/env node

/**
 * Script para crear más fichas en la base de datos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMoreFichas() {
  try {
    console.log('📚 Creando más fichas en la base de datos...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Obtener el programa de formación existente
    const programaFormacion = await prisma.programaFormacion.findFirst()
    
    if (!programaFormacion) {
      console.log('❌ No se encontró ningún programa de formación')
      return
    }
    
    console.log(`📋 Usando programa: ${programaFormacion.nombre_programa}`)
    
    // Crear fichas adicionales
    const fichasNuevas = [
      { numero: '2567844', descripcion: 'Ficha de Desarrollo de Software' },
      { numero: '2567845', descripcion: 'Ficha de Bases de Datos' },
      { numero: '2567846', descripcion: 'Ficha de Redes de Computadores' },
      { numero: '2567847', descripcion: 'Ficha de Programación Web' },
      { numero: '2567848', descripcion: 'Ficha de Seguridad Informática' },
      { numero: '2567849', descripcion: 'Ficha de Inteligencia Artificial' },
      { numero: '2567850', descripcion: 'Ficha de Ciberseguridad' },
      { numero: '2567851', descripcion: 'Ficha de Desarrollo Móvil' },
      { numero: '2567852', descripcion: 'Ficha de Cloud Computing' },
      { numero: '2567853', descripcion: 'Ficha de DevOps' }
    ]
    
    let fichasCreadas = 0
    let fichasExistentes = 0
    
    for (const ficha of fichasNuevas) {
      // Verificar si la ficha ya existe
      const fichaExistente = await prisma.ficha.findFirst({
        where: { numero_ficha: ficha.numero }
      })
      
      if (fichaExistente) {
        console.log(`ℹ️  Ficha ${ficha.numero} ya existe`)
        fichasExistentes++
      } else {
        // Crear nueva ficha
        await prisma.ficha.create({
          data: {
            numero_ficha: ficha.numero,
            id_programa_formacion: programaFormacion.idPrograma_formacion
          }
        })
        console.log(`✅ Ficha ${ficha.numero} creada`)
        fichasCreadas++
      }
    }
    
    // Mostrar resumen
    console.log('\n📊 Resumen:')
    console.log(`   - Fichas creadas: ${fichasCreadas}`)
    console.log(`   - Fichas existentes: ${fichasExistentes}`)
    console.log(`   - Total procesadas: ${fichasNuevas.length}`)
    
    // Mostrar todas las fichas disponibles
    const todasLasFichas = await prisma.ficha.findMany({
      include: {
        programa_formacion: true
      },
      orderBy: {
        numero_ficha: 'asc'
      }
    })
    
    console.log('\n📋 Todas las fichas disponibles:')
    todasLasFichas.forEach(ficha => {
      console.log(`   - ${ficha.numero_ficha} (${ficha.programa_formacion.nombre_programa})`)
    })
    
    console.log('\n🎉 ¡Fichas creadas exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createMoreFichas()
}
