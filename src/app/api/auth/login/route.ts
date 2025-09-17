import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/database';
import { generateToken, ROLES } from '../../../../lib/auth';
// import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usemame, Contrasenia } = body;

    // Validar datos requeridos
    if (!usemame || !Contrasenia) {
      return NextResponse.json({
        message: 'Credenciales incompletas',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requieren usemame y Contrasenia'
      }, { status: 400 });
    }

    // Buscar usuario por username
    const usuario = await prisma.usuario.findFirst({
      where: {
        usemame: usemame
      },
      include: {
        rol: true,
        tipo_documento: true,
        estado_estudiante: true,
        genero: true,
        programa_formacion: true,
        nivel_formacion: true
      }
    });

    if (!usuario) {
      return NextResponse.json({
        message: 'Credenciales inválidas',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Usuario no encontrado'
      }, { status: 401 });
    }

    // Verificar contraseña (en producción, usar bcrypt)
    // Por ahora, comparación simple para desarrollo
    if (usuario.Contrasenia !== Contrasenia) {
      return NextResponse.json({
        message: 'Credenciales inválidas',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Contraseña incorrecta'
      }, { status: 401 });
    }

    // Verificar que el usuario sea Admin o Instructor
    const rolUsuario = usuario.rol.nombre_rol.toLowerCase();
    if (rolUsuario !== ROLES.INSTRUCTOR && rolUsuario !== ROLES.ADMIN) {
      return NextResponse.json({
        message: 'Acceso denegado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Solo administradores e instructores pueden acceder'
      }, { status: 403 });
    }

    // Generar token JWT
    const userPayload = {
      id: usuario.id_usuario,
      usemame: usuario.usemame,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol.nombre_rol.toLowerCase(),
      correo_electronico: usuario.correo_electronico
    };

    const token = generateToken(userPayload);

    return NextResponse.json({
      message: 'Login exitoso',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        token,
        user: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          usemame: usuario.usemame,
          correo_electronico: usuario.correo_electronico,
          rol: usuario.rol.nombre_rol.toLowerCase(),
          telefono: usuario.telefono,
          numero_documento: usuario.numero_documento,
          tipo_documento: usuario.tipo_documento.nombre_documento,
          estado_estudiante: usuario.estado_estudiante.descripcion_estado,
          genero: usuario.genero.descripcion,
          programa_formacion: usuario.programa_formacion.nombre_programa,
          nivel_formacion: usuario.nivel_formacion.Id_Nivel_de_formacioncol
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET - Verificar token actual
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        message: 'Token no proporcionado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Header Authorization requerido'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { verifyToken } = await import('../../../../lib/auth');
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({
        message: 'Token inválido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Token expirado o inválido'
      }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Token válido',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        user
      }
    });

  } catch (error) {
    return NextResponse.json({
      message: 'Error al verificar token',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
