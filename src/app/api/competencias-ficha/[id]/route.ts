import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que la asociación existe
    const asociacionExistente = await prisma.competenciaFicha.findUnique({
      where: { id_competencia_ficha: id },
      include: {
        competencia: {
          include: {
            _count: {
              select: {
                clases: true
              }
            }
          }
        }
      }
    })

    if (!asociacionExistente) {
      return NextResponse.json(
        { success: false, error: 'Asociación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si la competencia tiene clases asociadas
    if (asociacionExistente.competencia._count.clases > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar la asociación porque la competencia tiene clases registradas' },
        { status: 400 }
      )
    }

    await prisma.competenciaFicha.delete({
      where: { id_competencia_ficha: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Asociación eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar asociación:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
