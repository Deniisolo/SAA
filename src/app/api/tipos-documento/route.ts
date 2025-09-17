import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const tiposDocumento = await prisma.tipoDocumento.findMany({
      orderBy: {
        nombre_documento: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: tiposDocumento
    })
  } catch (error) {
    console.error('Error al obtener tipos de documento:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

