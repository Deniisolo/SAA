import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const estadosEstudiante = await prisma.estadoEstudiante.findMany({
      orderBy: {
        descripcion_estado: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: estadosEstudiante
    })
  } catch (error) {
    console.error('Error al obtener estados de estudiante:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

