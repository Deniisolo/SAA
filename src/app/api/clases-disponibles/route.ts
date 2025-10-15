import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    const clases = await prisma.$queryRawUnsafe<Array<{
      id_clase: number
      nombre_clase: string
      fecha_clase: Date
      hora_inicio: string
      hora_fin: string
      id_competencia: number
      nombre_competencia: string
    }>>(`
      SELECT 
        c.id_clase,
        c.nombre_clase,
        c.fecha_clase,
        c.hora_inicio,
        c.hora_fin,
        comp.id_competencia,
        comp.nombre_competencia
      FROM clase c
      JOIN competencia comp ON comp.id_competencia = c.id_competencia
      ORDER BY c.fecha_clase DESC, c.hora_inicio ASC
    `)

    return NextResponse.json({ success: true, data: clases })
  } catch (error) {
    console.error('Error al obtener clases disponibles:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


