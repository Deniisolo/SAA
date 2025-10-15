import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    // Obtener competencias con el total de clases asociadas
    const competencias = await prisma.$queryRawUnsafe<Array<{
      id_competencia: number
      nombre_competencia: string
      codigo_competencia: string
      total_clases: number
    }>>(`
      SELECT 
        c.id_competencia,
        c.nombre_competencia,
        c.codigo_competencia,
        COUNT(cl.id_clase) AS total_clases
      FROM competencia c
      LEFT JOIN clase cl ON cl.id_competencia = c.id_competencia
      GROUP BY c.id_competencia, c.nombre_competencia, c.codigo_competencia
      ORDER BY c.nombre_competencia ASC
    `)

    return NextResponse.json({ success: true, data: competencias })
  } catch (error) {
    console.error('Error al obtener competencias disponibles:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
