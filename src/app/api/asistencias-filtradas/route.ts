import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idCompetencia = searchParams.get('competencia')
    const fecha = searchParams.get('fecha')
    const idClase = searchParams.get('clase')

    let whereClause = ''
    const params: (string | number)[] = []

    if (idClase) {
      whereClause = 'WHERE a.id_clase = ?'
      params.push(parseInt(idClase))
    } else if (idCompetencia && fecha) {
      whereClause = 'WHERE c.id_competencia = ? AND DATE(c.fecha_clase) = ?'
      params.push(parseInt(idCompetencia), fecha)
    } else if (idCompetencia) {
      whereClause = 'WHERE c.id_competencia = ?'
      params.push(parseInt(idCompetencia))
    } else if (fecha) {
      whereClause = 'WHERE DATE(c.fecha_clase) = ?'
      params.push(fecha)
    }

    const query = `
      SELECT 
        a.id_asistencia,
        a.fecha_asistencia,
        a.hora_registro,
        a.estado_asistencia,
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.numero_documento,
        c.id_clase,
        c.nombre_clase,
        c.fecha_clase,
        c.hora_inicio,
        c.hora_fin,
        comp.id_competencia,
        comp.nombre_competencia,
        comp.codigo_competencia
      FROM asistencia a
      JOIN usuario u ON a.id_usuario = u.id_usuario
      JOIN clase c ON a.id_clase = c.id_clase
      JOIN competencia comp ON c.id_competencia = comp.id_competencia
      ${whereClause}
      ORDER BY c.fecha_clase DESC, u.nombre ASC
    `

    const asistencias = await prisma.$queryRawUnsafe(query, ...params)

    return NextResponse.json({
      success: true,
      data: asistencias
    })
  } catch (error) {
    console.error('Error al obtener asistencias filtradas:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
