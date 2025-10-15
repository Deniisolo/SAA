import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    // Obtener todas las clases con información de competencia e instructor
    const clases = await prisma.$queryRaw`
      SELECT 
        c.id_clase,
        c.nombre_clase,
        c.descripcion,
        c.fecha_clase,
        c.hora_inicio,
        c.hora_fin,
        c.id_competencia,
        c.id_instructor,
        comp.nombre_competencia,
        comp.codigo_competencia,
        u.nombre as instructor_nombre,
        u.apellido as instructor_apellido
      FROM clase c
      LEFT JOIN competencia comp ON c.id_competencia = comp.id_competencia
      LEFT JOIN usuario u ON c.id_instructor = u.id_usuario
      ORDER BY c.fecha_clase DESC, c.hora_inicio ASC
    `

    // Obtener conteo de asistencias por separado para evitar problemas con BigInt
    const clasesConAsistencias = await Promise.all(
      (clases as Array<{
        id_clase: number
        nombre_clase: string
        descripcion: string | null
        fecha_clase: Date
        hora_inicio: string
        hora_fin: string
        id_competencia: number
        id_instructor: number
        nombre_competencia: string
        codigo_competencia: string
        instructor_nombre: string
        instructor_apellido: string
      }>).map(async (clase) => {
        const asistenciasCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM asistencia WHERE id_clase = ${clase.id_clase}
        ` as Array<{ count: bigint }>
        return {
          ...clase,
          _count: {
            asistencias: Number(asistenciasCount[0].count)
          },
          competencia: {
            nombre: clase.nombre_competencia,
            codigo: clase.codigo_competencia
          },
          instructor: {
            nombre: clase.instructor_nombre,
            apellido: clase.instructor_apellido
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: clasesConAsistencias
    })
  } catch (error) {
    console.error('Error al obtener clases:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nombre_clase, 
      descripcion, 
      fecha_clase, 
      hora_inicio, 
      hora_fin, 
      id_competencia, 
      id_instructor 
    } = body

    // Validar campos requeridos
    if (!nombre_clase || !fecha_clase || !hora_inicio || !hora_fin || !id_competencia || !id_instructor) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Crear la clase
    const clase = await prisma.$executeRaw`
      INSERT INTO clase (nombre_clase, descripcion, fecha_clase, hora_inicio, hora_fin, id_competencia, id_instructor)
      VALUES (${nombre_clase}, ${descripcion || null}, ${fecha_clase}, ${hora_inicio}, ${hora_fin}, ${parseInt(id_competencia)}, ${parseInt(id_instructor)})
    `

    return NextResponse.json({
      success: true,
      message: 'Clase creada exitosamente',
      data: { id: clase }
    })
  } catch (error) {
    console.error('Error al crear clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}