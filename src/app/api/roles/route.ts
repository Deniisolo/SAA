import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: {
        nombre_rol: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: roles
    })
  } catch (error) {
    console.error('Error al obtener roles:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

