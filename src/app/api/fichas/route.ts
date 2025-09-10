import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { numero_ficha, id_programa_formacion } = body

    // Validar campos requeridos
    if (!numero_ficha || !id_programa_formacion) {
      return NextResponse.json(
        { success: false, error: 'Número de ficha e ID de programa de formación son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el programa de formación existe
    const programa = await prisma.programaFormacion.findUnique({
      where: { idPrograma_formacion: parseInt(id_programa_formacion) }
    })

    if (!programa) {
      return NextResponse.json(
        { success: false, error: 'Programa de formación no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no existe ya una ficha con este número
    const fichaExistente = await prisma.ficha.findFirst({
      where: { numero_ficha }
    })

    if (fichaExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una ficha con este número' },
        { status: 400 }
      )
    }

    const ficha = await prisma.ficha.create({
      data: {
        numero_ficha,
        id_programa_formacion: parseInt(id_programa_formacion)
      },
      include: {
        programa_formacion: true
      }
    })

    return NextResponse.json({
      success: true,
      data: ficha
    })
  } catch (error) {
    console.error('Error al crear ficha:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
