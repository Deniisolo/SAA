import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idClase = parseInt(id)

    if (isNaN(idClase)) {
      return NextResponse.json(
        { success: false, error: 'ID de clase inválido' },
        { status: 400 }
      )
    }

    // Obtener asistencias de la clase específica
    const asistencias = await prisma.$queryRaw`
      SELECT 
        a.id_asistencia,
        a.fecha_asistencia,
        a.estado_asistencia,
        u.nombre,
        u.apellido,
        u.numero_documento,
        c.nombre_clase,
        c.hora_inicio,
        c.hora_fin,
        comp.nombre_competencia
      FROM asistencia a
      JOIN usuario u ON a.id_usuario = u.id_usuario
      JOIN clase c ON a.id_clase = c.id_clase
      JOIN competencia comp ON c.id_competencia = comp.id_competencia
      WHERE a.id_clase = ${idClase}
      ORDER BY a.fecha_asistencia ASC
    `

    return NextResponse.json({
      success: true,
      data: asistencias
    })
  } catch (error) {
    console.error('Error al obtener asistencias de la clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}