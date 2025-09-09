import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    // Usar SQL raw temporalmente hasta que Prisma reconozca el modelo
    const competencias = await prisma.$queryRaw`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM clase WHERE id_competencia = c.id_competencia) as clases_count,
        (SELECT COUNT(*) FROM competencia_ficha WHERE id_competencia = c.id_competencia) as competencias_ficha_count
      FROM competencia c
      ORDER BY c.nombre_competencia ASC
    `

    // Convertir BigInt a números para evitar errores de serialización
    const competenciasSerializadas = (competencias as any[]).map(competencia => ({
      ...competencia,
      clases_count: Number(competencia.clases_count),
      competencias_ficha_count: Number(competencia.competencias_ficha_count)
    }))

    return NextResponse.json({
      success: true,
      data: competenciasSerializadas
    })
  } catch (error) {
    console.error('Error al obtener competencias:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre_competencia, descripcion, codigo_competencia } = body

    // Validar campos requeridos
    if (!nombre_competencia || !codigo_competencia) {
      return NextResponse.json(
        { success: false, error: 'Nombre y código de competencia son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el código no exista
    const competenciaExistente = await prisma.competencia.findFirst({
      where: { codigo_competencia }
    })

    if (competenciaExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una competencia con este código' },
        { status: 400 }
      )
    }

    const competencia = await prisma.competencia.create({
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
    console.error('Error al crear competencia:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
