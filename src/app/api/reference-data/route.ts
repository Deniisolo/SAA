import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cache simple en memoria (en producción usar Redis o similar)
let cache: any = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function GET() {
  try {
    const now = Date.now()
    
    // Verificar si el cache es válido
    if (cache && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cache,
        cached: true
      })
    }

    // Cargar todos los datos de referencia en paralelo - optimizado
    const [
      roles,
      tiposDocumento,
      estadosEstudiante,
      fichas,
      generos,
      programasFormacion
    ] = await Promise.all([
      prisma.rol.findMany({
        select: {
          id_Rol: true,
          nombre_rol: true
        },
        orderBy: { nombre_rol: 'asc' }
      }),
      prisma.tipoDocumento.findMany({
        select: {
          id_Tipo_Documento: true,
          nombre_documento: true
        },
        orderBy: { nombre_documento: 'asc' }
      }),
      prisma.estadoEstudiante.findMany({
        select: {
          id_estado_estudiante: true,
          descripcion_estado: true
        },
        orderBy: { descripcion_estado: 'asc' }
      }),
      prisma.ficha.findMany({
        select: {
          id_ficha: true,
          numero_ficha: true,
          programa_formacion: {
            select: {
              idPrograma_formacion: true,
              nombre_programa: true
            }
          }
        },
        orderBy: { numero_ficha: 'asc' }
      }),
      prisma.genero.findMany({
        select: {
          id_genero: true,
          descripcion: true
        },
        orderBy: { descripcion: 'asc' }
      }),
      prisma.programaFormacion.findMany({
        select: {
          idPrograma_formacion: true,
          nombre_programa: true
        },
        orderBy: { nombre_programa: 'asc' }
      })
    ])

    const data = {
      roles,
      tiposDocumento,
      estadosEstudiante,
      fichas,
      generos,
      programasFormacion
    }

    // Actualizar cache
    cache = data
    cacheTimestamp = now

    return NextResponse.json({
      success: true,
      data,
      cached: false
    })
  } catch (error) {
    console.error('Error al obtener datos de referencia:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
