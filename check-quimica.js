#!/usr/bin/env node

/**
 * Script para verificar programas de química
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkQuimica() {
  try {
    console.log('🧪 Verificando programas de química...')
    
    await prisma.$connect()
    console.log('✅ Conexión establecida')
    
    // Buscar programas de química
    const programasQuimica = await prisma.programaFormacion.findMany({
      where: {
        nombre_programa: {
          contains: 'Química'
        }
      },
      orderBy: { nombre_programa: 'asc' }
    })
    
    console.log(`\n🧪 Programas de Química encontrados: ${programasQuimica.length}`)
    programasQuimica.forEach(programa => {
      console.log(`   - ${programa.nombre_programa} (${programa.nivel_formacion})`)
    })
    
    // Mostrar total de programas
    const totalProgramas = await prisma.programaFormacion.count()
    console.log(`\n📋 Total de programas: ${totalProgramas}`)
    
    // Mostrar algunos ejemplos
    const ejemplos = await prisma.programaFormacion.findMany({
      take: 10,
      orderBy: { nombre_programa: 'asc' }
    })
    
    console.log('\n📝 Ejemplos de programas:')
    ejemplos.forEach(programa => {
      console.log(`   - ${programa.nombre_programa} (${programa.nivel_formacion})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkQuimica()
}
