import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

// POST - Asociar estudiante a clase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_usuario, id_clase } = body

    if (!id_usuario || !id_clase) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario e ID de clase son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si la asociación ya existe
    const asociacionExistente = await prisma.estudianteClase.findFirst({
      where: {
        id_usuario: parseInt(id_usuario),
        id_clase: parseInt(id_clase)
      }
    })

    if (asociacionExistente) {
      return NextResponse.json(
        { success: false, error: 'El estudiante ya está asociado a esta clase' },
        { status: 400 }
      )
    }

    // Crear la asociación
    const nuevaAsociacion = await prisma.estudianteClase.create({
      data: {
        id_usuario: parseInt(id_usuario),
        id_clase: parseInt(id_clase)
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        clase: {
          select: {
            nombre_clase: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Estudiante asociado a la clase exitosamente',
      data: nuevaAsociacion
    })
  } catch (error) {
    console.error('Error al asociar estudiante a clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desasociar estudiante de clase
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id_usuario = searchParams.get('id_usuario')
    const id_clase = searchParams.get('id_clase')

    if (!id_usuario || !id_clase) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario e ID de clase son requeridos' },
        { status: 400 }
      )
    }

    // Eliminar la asociación
    const asociacionEliminada = await prisma.estudianteClase.deleteMany({
      where: {
        id_usuario: parseInt(id_usuario),
        id_clase: parseInt(id_clase)
      }
    })

    if (asociacionEliminada.count === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontró la asociación' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Estudiante desasociado de la clase exitosamente'
    })
  } catch (error) {
    console.error('Error al desasociar estudiante de clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
