import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    // Usar la consulta simple que sabemos que funciona
    const competencias = await prisma.$queryRaw`
      SELECT * FROM competencia ORDER BY nombre_competencia ASC
    `

    return NextResponse.json({
      success: true,
      data: competencias
    })
  } catch (error) {
    console.error('Error al obtener competencias:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
