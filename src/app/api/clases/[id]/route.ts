import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const clase = await prisma.clase.findUnique({
      where: { id_clase: id },
      include: {
        competencia: true,
        instructor: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        _count: {
          select: {
            asistencias: true
          }
        }
      }
    })

    if (!clase) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: clase
    })
  } catch (error) {
    console.error('Error al obtener clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { nombre_clase, descripcion, fecha_clase, hora_inicio, hora_fin, id_competencia, id_instructor } = body

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que la clase existe
    const claseExistente = await prisma.clase.findUnique({
      where: { id_clase: id }
    })

    if (!claseExistente) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la competencia existe
    const competencia = await prisma.competencia.findUnique({
      where: { id_competencia: parseInt(id_competencia) }
    })

    if (!competencia) {
      return NextResponse.json(
        { success: false, error: 'Competencia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el instructor existe y tiene rol de instructor
    const instructor = await prisma.usuario.findUnique({
      where: { id_usuario: parseInt(id_instructor) },
      include: { rol: true }
    })

    if (!instructor) {
      return NextResponse.json(
        { success: false, error: 'Instructor no encontrado' },
        { status: 404 }
      )
    }

    if (instructor.rol.nombre_rol !== 'instructor') {
      return NextResponse.json(
        { success: false, error: 'El usuario seleccionado no es un instructor' },
        { status: 400 }
      )
    }

    const clase = await prisma.clase.update({
      where: { id_clase: id },
      data: {
        nombre_clase,
        descripcion,
        fecha_clase: new Date(fecha_clase),
        hora_inicio,
        hora_fin,
        id_competencia: parseInt(id_competencia),
        id_instructor: parseInt(id_instructor)
      },
      include: {
        competencia: true,
        instructor: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: clase
    })
  } catch (error) {
    console.error('Error al actualizar clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que la clase existe
    const claseExistente = await prisma.clase.findUnique({
      where: { id_clase: id },
      include: {
        _count: {
          select: {
            asistencias: true
          }
        }
      }
    })

    if (!claseExistente) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene asistencias registradas
    if (claseExistente._count.asistencias > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una clase que tiene asistencias registradas' },
        { status: 400 }
      )
    }

    await prisma.clase.delete({
      where: { id_clase: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Clase eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
