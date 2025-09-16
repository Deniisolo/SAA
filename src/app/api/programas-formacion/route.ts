import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const programas = await prisma.programaFormacion.findMany({
      orderBy: {
        nombre_programa: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: programas
    })
  } catch (error) {
    console.error('Error al obtener programas de formación:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
