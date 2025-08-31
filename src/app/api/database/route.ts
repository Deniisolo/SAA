import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseConnection } from '../../../lib/database';

// GET - Verificar conexión a la base de datos
export async function GET() {
  try {
    const connectionStatus = await checkDatabaseConnection();
    
    return NextResponse.json({
      message: 'Estado de la conexión a MySQL',
      timestamp: new Date().toISOString(),
      status: connectionStatus.status,
      details: connectionStatus.message
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al verificar la conexión',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST - Crear un usuario de prueba
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validar datos requeridos
    if (!name || !email || !password) {
      return NextResponse.json({
        message: 'Datos incompletos',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requieren name, email y password'
      }, { status: 400 });
    }

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // En producción, hashear la contraseña
        role: 'USER'
      }
    });

    return NextResponse.json({
      message: 'Usuario creado correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al crear usuario',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PUT - Actualizar un usuario
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email } = body;

    if (!id) {
      return NextResponse.json({
        message: 'ID requerido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requiere el ID del usuario'
      }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        email: email || undefined
      }
    });

    return NextResponse.json({
      message: 'Usuario actualizado correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al actualizar usuario',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// DELETE - Eliminar un usuario
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        message: 'ID requerido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requiere el ID del usuario'
      }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      message: 'Usuario eliminado correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      deletedId: id
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al eliminar usuario',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
