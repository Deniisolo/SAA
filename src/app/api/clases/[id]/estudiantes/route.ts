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

    // Obtener estudiantes asociados a la clase
    const estudiantes = await prisma.estudianteClase.findMany({
      where: {
        id_clase: idClase
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            numero_documento: true,
            correo_electronico: true,
            telefono: true,
            codigo_qr: true,
            ficha: {
              select: {
                numero_ficha: true,
                programa_formacion: {
                  select: {
                    nombre_programa: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        usuario: {
          nombre: 'asc'
        }
      }
    })

    // Formatear los datos
    const estudiantesFormateados = estudiantes.map(ec => ({
      id_usuario: ec.usuario.id_usuario,
      nombre: ec.usuario.nombre,
      apellido: ec.usuario.apellido,
      nombre_completo: `${ec.usuario.nombre} ${ec.usuario.apellido}`,
      numero_documento: ec.usuario.numero_documento,
      correo_electronico: ec.usuario.correo_electronico,
      telefono: ec.usuario.telefono,
      codigo_qr: ec.usuario.codigo_qr,
      ficha: ec.usuario.ficha.numero_ficha,
      programa: ec.usuario.ficha.programa_formacion.nombre_programa,
      fecha_asociacion: ec.fecha_asociacion
    }))

    return NextResponse.json({
      success: true,
      data: estudiantesFormateados
    })
  } catch (error) {
    console.error('Error al obtener estudiantes de la clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
