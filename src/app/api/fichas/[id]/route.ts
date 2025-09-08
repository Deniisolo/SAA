import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(
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

    const ficha = await prisma.ficha.findUnique({
      where: { id_ficha: id },
      include: {
        programa_formacion: true,
        _count: {
          select: {
            usuarios: true
          }
        }
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { success: false, error: 'Ficha no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ficha
    })
  } catch (error) {
    console.error('Error al obtener ficha:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { numero_ficha, id_programa_formacion } = body

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que la ficha existe
    const fichaExistente = await prisma.ficha.findUnique({
      where: { id_ficha: id }
    })

    if (!fichaExistente) {
      return NextResponse.json(
        { success: false, error: 'Ficha no encontrada' },
        { status: 404 }
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

    // Si se está cambiando el número de ficha, verificar que no exista otro con el mismo número
    if (numero_ficha && numero_ficha !== fichaExistente.numero_ficha) {
      const numeroExistente = await prisma.ficha.findFirst({
        where: { 
          numero_ficha,
          id_ficha: { not: id }
        }
      })

      if (numeroExistente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe una ficha con este número' },
          { status: 400 }
        )
      }
    }

    const ficha = await prisma.ficha.update({
      where: { id_ficha: id },
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
    console.error('Error al actualizar ficha:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

    // Verificar que la ficha existe
    const fichaExistente = await prisma.ficha.findUnique({
      where: { id_ficha: id },
      include: {
        _count: {
          select: {
            usuarios: true
          }
        }
      }
    })

    if (!fichaExistente) {
      return NextResponse.json(
        { success: false, error: 'Ficha no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene usuarios asociados
    if (fichaExistente._count.usuarios > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una ficha que tiene usuarios asociados' },
        { status: 400 }
      )
    }

    await prisma.ficha.delete({
      where: { id_ficha: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Ficha eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar ficha:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
