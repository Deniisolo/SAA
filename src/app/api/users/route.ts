import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/database';

// GET - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    // Obtener usuarios con paginación
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
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
        users,
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
    const { users } = body;

    if (!Array.isArray(users)) {
      return NextResponse.json({
        message: 'Formato inválido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requiere un array de usuarios'
      }, { status: 400 });
    }

    // Crear usuarios
    const createdUsers = await prisma.user.createMany({
      data: users.map((user: any) => ({
        name: user.name,
        email: user.email,
        password: user.password || 'password123',
        role: user.role || 'USER'
      })),
      skipDuplicates: true
    });

    return NextResponse.json({
      message: 'Usuarios creados correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        count: createdUsers.count,
        message: `${createdUsers.count} usuarios creados`
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
