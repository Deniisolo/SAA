import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

// GET - Listar fichas disponibles
export async function GET(request: NextRequest) {
  try {
    const fichas = await prisma.ficha.findMany({
      include: {
        programa_formacion: true
      },
      orderBy: {
        numero_ficha: 'asc'
      }
    });

    return NextResponse.json({
      message: 'Fichas obtenidas correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        fichas: fichas.map(ficha => ({
          id: ficha.id_ficha,
          numero: ficha.numero_ficha,
          programa: ficha.programa_formacion.nombre_programa
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener fichas:', error);
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
