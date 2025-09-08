import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const competenciasFicha = await prisma.competenciaFicha.findMany({
      include: {
        competencia: true,
        ficha: {
          include: {
            programa_formacion: true
          }
        }
      },
      orderBy: [
        { ficha: { numero_ficha: 'asc' } },
        { competencia: { nombre_competencia: 'asc' } }
      ]
    })

    return NextResponse.json({
      success: true,
      data: competenciasFicha
    })
  } catch (error) {
    console.error('Error al obtener asociaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_competencia, id_ficha } = body

    // Validar campos requeridos
    if (!id_competencia || !id_ficha) {
      return NextResponse.json(
        { success: false, error: 'ID de competencia e ID de ficha son requeridos' },
        { status: 400 }
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

    // Verificar que la ficha existe
    const ficha = await prisma.ficha.findUnique({
      where: { id_ficha: parseInt(id_ficha) }
    })

    if (!ficha) {
      return NextResponse.json(
        { success: false, error: 'Ficha no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no existe ya esta asociación
    const asociacionExistente = await prisma.competenciaFicha.findFirst({
      where: {
        id_competencia: parseInt(id_competencia),
        id_ficha: parseInt(id_ficha)
      }
    })

    if (asociacionExistente) {
      return NextResponse.json(
        { success: false, error: 'Esta asociación ya existe' },
        { status: 400 }
      )
    }

    const competenciaFicha = await prisma.competenciaFicha.create({
      data: {
        id_competencia: parseInt(id_competencia),
        id_ficha: parseInt(id_ficha)
      },
      include: {
        competencia: true,
        ficha: {
          include: {
            programa_formacion: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: competenciaFicha
    })
  } catch (error) {
    console.error('Error al crear asociación:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
