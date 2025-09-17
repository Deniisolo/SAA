import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const generos = await prisma.genero.findMany({
      orderBy: {
        descripcion: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: generos
    })
  } catch (error) {
    console.error('Error al obtener géneros:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

