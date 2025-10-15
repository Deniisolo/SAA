import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idCompetencia = searchParams.get('competencia')
    const fecha = searchParams.get('fecha')
    const idClase = searchParams.get('clase')

    // Ramas por combinación de filtros usando consultas parametrizadas
    if (idClase && fecha) {
      // Consulta por clase y fecha
      const asistenciasPorClaseYFecha = await prisma.$queryRaw`
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
        WHERE a.id_clase = ${parseInt(idClase)} AND DATE(c.fecha_clase) = ${fecha}
        ORDER BY c.fecha_clase DESC, u.nombre ASC
      `

      return NextResponse.json({ success: true, data: asistenciasPorClaseYFecha })
    } else if (idClase) {
      // Consulta directa por clase de forma segura
      const asistenciasPorClase = await prisma.$queryRaw`
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
        WHERE a.id_clase = ${parseInt(idClase)}
        ORDER BY c.fecha_clase DESC, u.nombre ASC
      `

      return NextResponse.json({ success: true, data: asistenciasPorClase })
    } else if (idCompetencia && fecha) {
      const asistencias = await prisma.$queryRaw`
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
        WHERE c.id_competencia = ${parseInt(idCompetencia)} AND DATE(c.fecha_clase) = ${fecha}
        ORDER BY c.fecha_clase DESC, u.nombre ASC
      `
      return NextResponse.json({ success: true, data: asistencias })
    } else if (idCompetencia) {
      const asistencias = await prisma.$queryRaw`
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
        WHERE c.id_competencia = ${parseInt(idCompetencia)}
        ORDER BY c.fecha_clase DESC, u.nombre ASC
      `
      return NextResponse.json({ success: true, data: asistencias })
    } else if (fecha) {
      const asistencias = await prisma.$queryRaw`
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
        WHERE DATE(c.fecha_clase) = ${fecha}
        ORDER BY c.fecha_clase DESC, u.nombre ASC
      `
      return NextResponse.json({ success: true, data: asistencias })
    }

    // Sin filtros: devolver todo
    const asistencias = await prisma.$queryRaw`
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
      ORDER BY c.fecha_clase DESC, u.nombre ASC
    `

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
