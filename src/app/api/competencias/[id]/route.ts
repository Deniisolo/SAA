import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const competencia = await prisma.competencia.findUnique({
      where: { id_competencia: id },
      include: {
        _count: {
          select: {
            clases: true,
            competencias_ficha: true
          }
        }
      }
    })

    if (!competencia) {
      return NextResponse.json(
        { success: false, error: 'Competencia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: competencia
    })
  } catch (error) {
    console.error('Error al obtener competencia:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam)
    const body = await request.json()
    const { nombre_competencia, descripcion, codigo_competencia } = body

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que la competencia existe
    const competenciaExistente = await prisma.competencia.findUnique({
      where: { id_competencia: id }
    })

    if (!competenciaExistente) {
      return NextResponse.json(
        { success: false, error: 'Competencia no encontrada' },
        { status: 404 }
      )
    }

    // Si se está cambiando el código, verificar que no exista otro con el mismo código
    if (codigo_competencia && codigo_competencia !== competenciaExistente.codigo_competencia) {
      const codigoExistente = await prisma.competencia.findFirst({
        where: { 
          codigo_competencia,
          id_competencia: { not: id }
        }
      })

      if (codigoExistente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe una competencia con este código' },
          { status: 400 }
        )
      }
    }

    const competencia = await prisma.competencia.update({
      where: { id_competencia: id },
      data: {
        nombre_competencia,
        descripcion,
        codigo_competencia
      }
    })

    return NextResponse.json({
      success: true,
      data: competencia
    })
  } catch (error) {
    console.error('Error al actualizar competencia:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que la competencia existe
    const competenciaExistente = await prisma.competencia.findUnique({
      where: { id_competencia: id },
      include: {
        _count: {
          select: {
            clases: true,
            competencias_ficha: true
          }
        }
      }
    })

    if (!competenciaExistente) {
      return NextResponse.json(
        { success: false, error: 'Competencia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene clases o asociaciones
    if (competenciaExistente._count.clases > 0 || competenciaExistente._count.competencias_ficha > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una competencia que tiene clases o está asociada a fichas' },
        { status: 400 }
      )
    }

    await prisma.competencia.delete({
      where: { id_competencia: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Competencia eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar competencia:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
