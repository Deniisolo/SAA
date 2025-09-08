import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Obteniendo competencias de química...')
    
    // Datos hardcodeados temporalmente
    const competencias = [
      {
        id_competencia: 1,
        nombre_competencia: 'Análisis Químico',
        descripcion: 'Competencia para realizar análisis químicos básicos y avanzados',
        codigo_competencia: 'QUIM001',
        clases_count: 0,
        competencias_ficha_count: 0
      },
      {
        id_competencia: 2,
        nombre_competencia: 'Razonamiento Cuantitativo',
        descripcion: 'Competencia para aplicar razonamiento matemático en problemas químicos',
        codigo_competencia: 'QUIM002',
        clases_count: 0,
        competencias_ficha_count: 0
      },
      {
        id_competencia: 3,
        nombre_competencia: 'Ciencias Naturales',
        descripcion: 'Competencia en fundamentos de ciencias naturales aplicadas a la química',
        codigo_competencia: 'QUIM003',
        clases_count: 0,
        competencias_ficha_count: 0
      },
      {
        id_competencia: 4,
        nombre_competencia: 'Análisis Orgánico',
        descripcion: 'Competencia para realizar análisis de compuestos orgánicos',
        codigo_competencia: 'QUIM004',
        clases_count: 0,
        competencias_ficha_count: 0
      },
      {
        id_competencia: 5,
        nombre_competencia: 'Análisis Químico Instrumental',
        descripcion: 'Competencia para utilizar instrumentos de análisis químico',
        codigo_competencia: 'QUIM005',
        clases_count: 0,
        competencias_ficha_count: 0
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: competencias
    })
  } catch (error) {
    console.error('❌ Error:', error)
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
