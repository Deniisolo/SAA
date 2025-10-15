import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'ID del instructor es requerido' },
        { status: 400 }
      )
    }

    // Obtener todas las clases del instructor
    const clases = await prisma.clase.findMany({
      where: {
        id_instructor: parseInt(instructorId)
      },
      include: {
        competencia: {
          select: {
            nombre_competencia: true,
            codigo_competencia: true
          }
        },
        instructor: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        estudiantes: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_clase: 'desc'
      }
    })

    // Formatear los datos para el frontend
    const clasesFormateadas = clases.map(clase => ({
      id_clase: clase.id_clase,
      nombre_clase: clase.nombre_clase,
      descripcion: clase.descripcion,
      fecha_clase: clase.fecha_clase,
      hora_inicio: clase.hora_inicio,
      hora_fin: clase.hora_fin,
      competencia: {
        nombre: clase.competencia.nombre_competencia,
        codigo: clase.competencia.codigo_competencia
      },
      instructor: {
        nombre: clase.instructor.nombre,
        apellido: clase.instructor.apellido
      },
      total_estudiantes: clase.estudiantes.length,
      estudiantes: clase.estudiantes.map(ec => ({
        id_usuario: ec.usuario.nombre + ' ' + ec.usuario.apellido,
        nombre: ec.usuario.nombre + ' ' + ec.usuario.apellido,
        fecha_asociacion: ec.fecha_asociacion
      }))
    }))

    return NextResponse.json({
      success: true,
      data: clasesFormateadas
    })
  } catch (error) {
    console.error('Error al obtener clases disponibles:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}