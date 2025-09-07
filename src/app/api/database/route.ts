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
    const { 
      nombre, 
      apellido, 
      correo_electronico, 
      telefono, 
      numero_documento, 
      usemame, 
      Contrasenia,
      rol_id,
      tipo_documento_id,
      estado_estudiante_id,
      ficha_id,
      genero_id,
      programa_formacion_id,
      nivel_formacion_id
    } = body;

    // Validar datos requeridos
    if (!nombre || !apellido || !correo_electronico || !usemame || !Contrasenia) {
      return NextResponse.json({
        message: 'Datos incompletos',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requieren nombre, apellido, correo_electronico, usemame y Contrasenia'
      }, { status: 400 });
    }

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        correo_electronico,
        telefono: telefono || '',
        numero_documento: numero_documento || '',
        usemame,
        Contrasenia,
        Rol_id_Rol: rol_id || 1,
        TipoDocumento_id_Tipo_Documento: tipo_documento_id || 1,
        EstadoEstudiante_id_estado_estudiante: estado_estudiante_id || 1,
        Ficha_id_ficha: ficha_id || 1,
        Genero_id_genero: genero_id || 1,
        Programa_formacion_idPrograma_formacion: programa_formacion_id || 1,
        Nivel_de_formacion_Id_Nivel_de_formacioncol: nivel_formacion_id || 'TECNICO'
      },
      include: {
        rol: true,
        tipo_documento: true,
        estado_estudiante: true,
        ficha: true,
        genero: true,
        programa_formacion: true,
        nivel_formacion: true
      }
    });

    return NextResponse.json({
      message: 'Usuario creado correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo_electronico: usuario.correo_electronico,
        usemame: usuario.usemame,
        rol: usuario.rol.nombre_rol,
        tipo_documento: usuario.tipo_documento.nombre_documento,
        estado_estudiante: usuario.estado_estudiante.descripcion_estado,
        genero: usuario.genero.descripcion,
        programa_formacion: usuario.programa_formacion.nombre_programa,
        nivel_formacion: usuario.nivel_formacion.Id_Nivel_de_formacioncol
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
    const { 
      id, 
      nombre, 
      apellido, 
      correo_electronico, 
      telefono, 
      numero_documento, 
      usemame 
    } = body;

    if (!id) {
      return NextResponse.json({
        message: 'ID requerido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Se requiere el ID del usuario'
      }, { status: 400 });
    }

    const usuario = await prisma.usuario.update({
      where: { id_usuario: parseInt(id) },
      data: {
        nombre: nombre || undefined,
        apellido: apellido || undefined,
        correo_electronico: correo_electronico || undefined,
        telefono: telefono || undefined,
        numero_documento: numero_documento || undefined,
        usemame: usemame || undefined
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

    return NextResponse.json({
      message: 'Usuario actualizado correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo_electronico: usuario.correo_electronico,
        usemame: usuario.usemame,
        rol: usuario.rol.nombre_rol,
        tipo_documento: usuario.tipo_documento.nombre_documento,
        estado_estudiante: usuario.estado_estudiante.descripcion_estado,
        genero: usuario.genero.descripcion,
        programa_formacion: usuario.programa_formacion.nombre_programa,
        nivel_formacion: usuario.nivel_formacion.Id_Nivel_de_formacioncol
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

    await prisma.usuario.delete({
      where: { id_usuario: parseInt(id) }
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
