import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'
import { determinarEstadoAsistencia, validarFormatoHora } from '../../../lib/asistencia-utils'

export async function GET() {
  try {
    const asistencias = await prisma.asistencia.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            numero_documento: true
          }
        },
        clase: {
          include: {
            competencia: {
              select: {
                nombre_competencia: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_asistencia: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: asistencias
    })
  } catch (error) {
    console.error('Error al obtener asistencias:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo_qr, id_clase, hora_registro } = body

    // Validar campos requeridos
    if (!codigo_qr || !id_clase) {
      return NextResponse.json(
        { success: false, error: 'Código QR e ID de clase son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por código QR
    const usuario = await prisma.usuario.findFirst({
      where: { codigo_qr: codigo_qr },
      include: { rol: true }
    })

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado con este código QR' },
        { status: 404 }
      )
    }

    // Verificar que la clase existe y obtener información
    const clase = await prisma.$queryRaw`
      SELECT * FROM clase WHERE id_clase = ${parseInt(id_clase)}
    `

    if (!clase || (clase as Array<unknown>).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    const claseData = (clase as Array<{
      id_clase: number
      id_ficha: number
      fecha_clase: Date
      hora_inicio: string
      hora_fin: string
      tema: string
      id_instructor: number
    }>)[0]

    // Verificar si ya existe una asistencia para este usuario en esta clase
    const asistenciaExistente = await prisma.$queryRaw`
      SELECT * FROM asistencia 
      WHERE id_usuario = ${usuario.id_usuario} 
      AND id_clase = ${parseInt(id_clase)}
    `

    if ((asistenciaExistente as Array<unknown>).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya se registró la asistencia para este usuario en esta clase' },
        { status: 400 }
      )
    }

    // Determinar estado de asistencia automáticamente usando el semáforo
    const horaActual = hora_registro || new Date().toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })

    const estadoAsistencia = determinarEstadoAsistencia(
      claseData.hora_inicio,
      horaActual,
      15 // 15 minutos de tolerancia
    )

    // Solo registrar hora_registro si la persona SÍ llegó (presente o tardanza)
    const horaRegistroFinal = (estadoAsistencia === 'presente' || estadoAsistencia === 'tardanza') 
      ? horaActual 
      : null

    // Crear la asistencia
    await prisma.$executeRaw`
      INSERT INTO asistencia (id_usuario, id_clase, estado_asistencia, fecha_asistencia, hora_registro)
      VALUES (${usuario.id_usuario}, ${parseInt(id_clase)}, ${estadoAsistencia}, NOW(), ${horaRegistroFinal})
    `

    // Obtener la asistencia creada con información completa
    const asistenciaCreada = await prisma.$queryRaw`
      SELECT 
        a.*,
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
      WHERE a.id_usuario = ${usuario.id_usuario} 
      AND a.id_clase = ${parseInt(id_clase)}
    `

    return NextResponse.json({
      success: true,
      message: `Asistencia registrada como: ${estadoAsistencia}`,
      data: {
        asistencia: (asistenciaCreada as Array<{
          id_asistencia: number
          id_usuario: number
          id_clase: number
          estado_asistencia: string
          hora_registro: string | null
          fecha_registro: Date
        }>)[0],
        estado_determinado: estadoAsistencia,
        hora_registro: horaRegistroFinal,
        hora_inicio_clase: claseData.hora_inicio
      }
    })
  } catch (error) {
    console.error('Error al crear asistencia:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
