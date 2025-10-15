import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function POST() {
  try {
    console.log('🧪 Agregando competencias de química...')
    
    const competenciasQuimica = [
      {
        nombre_competencia: 'Análisis Químico',
        descripcion: 'Competencia para realizar análisis químicos básicos y avanzados',
        codigo_competencia: 'QUIM001'
      },
      {
        nombre_competencia: 'Razonamiento Cuantitativo',
        descripcion: 'Competencia para aplicar razonamiento matemático en problemas químicos',
        codigo_competencia: 'QUIM002'
      },
      {
        nombre_competencia: 'Ciencias Naturales',
        descripcion: 'Competencia en fundamentos de ciencias naturales aplicadas a la química',
        codigo_competencia: 'QUIM003'
      },
      {
        nombre_competencia: 'Análisis Orgánico',
        descripcion: 'Competencia para realizar análisis de compuestos orgánicos',
        codigo_competencia: 'QUIM004'
      },
      {
        nombre_competencia: 'Análisis Químico Instrumental',
        descripcion: 'Competencia para utilizar instrumentos de análisis químico',
        codigo_competencia: 'QUIM005'
      }
    ]

    const competenciasCreadas = []
    const competenciasExistentes = []

    for (const competencia of competenciasQuimica) {
      try {
        // Verificar si ya existe
        const existente = await prisma.competencia.findFirst({
          where: { codigo_competencia: competencia.codigo_competencia }
        })

        if (!existente) {
          const creada = await prisma.competencia.create({
            data: competencia
          })
          competenciasCreadas.push(creada)
          console.log(`✅ Creada: ${creada.nombre_competencia} (${creada.codigo_competencia})`)
        } else {
          competenciasExistentes.push(existente)
          console.log(`⚠️  Ya existe: ${competencia.nombre_competencia} (${competencia.codigo_competencia})`)
        }
      } catch (error) {
        console.error(`❌ Error creando ${competencia.nombre_competencia}:`, error)
      }
    }

    // Obtener todas las competencias para mostrar
    const todasCompetencias = await prisma.competencia.findMany({
      orderBy: { nombre_competencia: 'asc' }
    })

    return NextResponse.json({
      success: true,
      message: 'Competencias de química procesadas correctamente',
      data: {
        creadas: competenciasCreadas,
        existentes: competenciasExistentes,
        total: todasCompetencias.length,
        todas: todasCompetencias
      }
    })
  } catch (error) {
    console.error('❌ Error agregando competencias de química:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
