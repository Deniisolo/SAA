import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

// POST - Crear nueva ficha
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { numero_ficha, id_programa_formacion } = body

    // Validaciones básicas
    if (!numero_ficha || !id_programa_formacion) {
      return NextResponse.json({
        message: 'Faltan campos requeridos',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El número de ficha y programa de formación son obligatorios'
      }, { status: 400 })
    }

    // Verificar si ya existe una ficha con el mismo número
    const fichaExistente = await prisma.ficha.findFirst({
      where: {
        numero_ficha: numero_ficha
      }
    })

    if (fichaExistente) {
      return NextResponse.json({
        message: 'Ya existe una ficha con este número',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El número de ficha ya está registrado'
      }, { status: 409 })
    }

    // Verificar que el programa de formación existe
    const programaExistente = await prisma.programaFormacion.findUnique({
      where: {
        idPrograma_formacion: parseInt(id_programa_formacion)
      }
    })

    if (!programaExistente) {
      return NextResponse.json({
        message: 'Programa de formación no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El programa de formación especificado no existe'
      }, { status: 404 })
    }

    // Crear la nueva ficha
    const nuevaFicha = await prisma.ficha.create({
      data: {
        numero_ficha: numero_ficha.trim(),
        id_programa_formacion: parseInt(id_programa_formacion)
      },
      include: {
        programa_formacion: true,
        _count: {
          select: {
            usuarios: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Ficha creada exitosamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: nuevaFicha
    })

  } catch (error) {
    console.error('Error al crear ficha:', error)
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const fichas = await prisma.ficha.findMany({
      include: {
        programa_formacion: true,
        _count: {
          select: {
            usuarios: true
          }
        }
      },
      orderBy: {
        numero_ficha: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: fichas
    })
  } catch (error) {
    console.error('Error al obtener fichas:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}