import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

// GET - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const rol = searchParams.get('rol') || '';
    const programa = searchParams.get('programa') || '';

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Construir filtros
    const where: {
      OR?: Array<{
        nombre: { contains: string; mode: 'insensitive' }
      } | {
        apellido: { contains: string; mode: 'insensitive' }
      } | {
        correo_electronico: { contains: string; mode: 'insensitive' }
      } | {
        numero_documento: { contains: string; mode: 'insensitive' }
      }>
      rol?: {
        nombre_rol: { contains: string; mode: 'insensitive' }
      }
      programa_formacion?: {
        nombre_programa: { contains: string; mode: 'insensitive' }
      }
    } = {};
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { correo_electronico: { contains: search, mode: 'insensitive' } },
        { numero_documento: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (rol) {
      where.rol = {
        nombre_rol: { contains: rol, mode: 'insensitive' }
      };
    }

    if (programa) {
      where.programa_formacion = {
        nombre_programa: { contains: programa, mode: 'insensitive' }
      };
    }

    // Obtener usuarios con paginación
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          correo_electronico: true,
          telefono: true,
          numero_documento: true,
          usemame: true,
          rol: {
            select: {
              nombre_rol: true
            }
          },
          tipo_documento: {
            select: {
              nombre_documento: true
            }
          },
          estado_estudiante: {
            select: {
              descripcion_estado: true
            }
          },
          genero: {
            select: {
              descripcion: true
            }
          },
          programa_formacion: {
            select: {
              nombre_programa: true,
              nivel_formacion: true
            }
          },
          nivel_formacion: {
            select: {
              Id_Nivel_de_formacioncol: true
            }
          },
          ficha: {
            select: {
              numero_ficha: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { id_usuario: 'desc' }
      }),
      prisma.usuario.count({ where })
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      message: 'Usuarios obtenidos correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        usuarios,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al obtener usuarios',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST - Crear múltiples usuarios (para testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarios } = body;

    if (!Array.isArray(usuarios)) {
      return NextResponse.json({
        message: 'Formato inválido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requiere un array de usuarios'
      }, { status: 400 });
    }

    // Crear usuarios
    const createdUsuarios = await prisma.usuario.createMany({
      data: usuarios.map((usuario: {
        nombre: string
        apellido: string
        correo_electronico: string
        telefono?: string
        numero_documento?: string
        usemame: string
        contrasena: string
        id_rol: number
        id_ficha?: number
      }) => ({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo_electronico: usuario.correo_electronico,
        telefono: usuario.telefono || '',
        numero_documento: usuario.numero_documento || '',
        usemame: usuario.usemame,
        Contrasenia: usuario.contrasena || 'password123',
        Rol_id_Rol: usuario.id_rol || 1,
        TipoDocumento_id_Tipo_Documento: 1,
        EstadoEstudiante_id_estado_estudiante: 1,
        Ficha_id_ficha: usuario.id_ficha || 1,
        Genero_id_genero: 1,
        Programa_formacion_idPrograma_formacion: 1,
        Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TECNICO'
      })),
      skipDuplicates: true
    });

    return NextResponse.json({
      message: 'Usuarios creados correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        count: createdUsuarios.count,
        message: `${createdUsuarios.count} usuarios creados`
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al crear usuarios',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
