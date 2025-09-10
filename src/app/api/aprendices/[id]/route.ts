import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/database';

// PUT - Actualizar aprendiz específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({
        message: 'ID inválido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El ID debe ser un número válido'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      nombre,
      apellido,
      tipoDocumento,
      numeroDocumento,
      genero,
      correo,
      celular,
      ficha
    } = body;

    // Validaciones básicas
    if (!nombre || !apellido || !numeroDocumento || !correo || !celular) {
      return NextResponse.json({
        message: 'Faltan campos requeridos',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Todos los campos marcados con * son obligatorios'
      }, { status: 400 });
    }

    // Verificar que el aprendiz existe
    const aprendizExistente = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol: true }
    });

    if (!aprendizExistente) {
      return NextResponse.json({
        message: 'Aprendiz no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El aprendiz especificado no existe'
      }, { status: 404 });
    }

    // Verificar que es un aprendiz
    if (aprendizExistente.rol.nombre_rol !== 'Aprendiz') {
      return NextResponse.json({
        message: 'Usuario no es un aprendiz',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Solo se pueden editar aprendices'
      }, { status: 403 });
    }

    // Verificar si ya existe otro usuario con el mismo número de documento
    const documentoExistente = await prisma.usuario.findFirst({
      where: {
        numero_documento: numeroDocumento,
        id_usuario: { not: id }
      }
    });

    if (documentoExistente) {
      return NextResponse.json({
        message: 'Ya existe otro usuario con este número de documento',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El número de documento ya está registrado por otro usuario'
      }, { status: 409 });
    }

    // Verificar si ya existe otro usuario con el mismo correo
    const correoExistente = await prisma.usuario.findFirst({
      where: {
        correo_electronico: correo,
        id_usuario: { not: id }
      }
    });

    if (correoExistente) {
      return NextResponse.json({
        message: 'Ya existe otro usuario con este correo electrónico',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El correo electrónico ya está registrado por otro usuario'
      }, { status: 409 });
    }

    // Mapear tipo de documento
    const tipoDocumentoMap: { [key: string]: number } = {
      'CC': 1, // Cédula de Ciudadanía
      'TI': 2, // Tarjeta de Identidad
      'CE': 3, // Cédula de Extranjería
      'PAS': 4  // Pasaporte
    };

    // Mapear género
    const generoMap: { [key: string]: number } = {
      'M': 1, // Masculino
      'F': 2  // Femenino
    };

    // Buscar la ficha por número
    const fichaEncontrada = await prisma.ficha.findFirst({
      where: {
        numero_ficha: ficha
      }
    });

    if (!fichaEncontrada) {
      return NextResponse.json({
        message: 'Ficha no encontrada',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'La ficha especificada no existe'
      }, { status: 404 });
    }

    // Actualizar el aprendiz
    const aprendizActualizado = await prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo_electronico: correo.trim(),
        telefono: celular.trim(),
        numero_documento: numeroDocumento.trim(),
        usemame: `${nombre.toLowerCase().replace(/\s+/g, '')}.${apellido.toLowerCase().replace(/\s+/g, '')}`,
        TipoDocumento_id_Tipo_Documento: tipoDocumentoMap[tipoDocumento] || 1,
        Ficha_id_ficha: fichaEncontrada.id_ficha,
        Genero_id_genero: generoMap[genero] || 1,
        Programa_formacion_idPrograma_formacion: fichaEncontrada.id_programa_formacion,
      },
      include: {
        rol: true,
        tipo_documento: true,
        estado_estudiante: true,
        genero: true,
        programa_formacion: true,
        nivel_formacion: true,
        ficha: true,
      }
    });

    return NextResponse.json({
      message: 'Aprendiz actualizado exitosamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        id: aprendizActualizado.id_usuario,
        nombre: aprendizActualizado.nombre,
        apellido: aprendizActualizado.apellido,
        correo: aprendizActualizado.correo_electronico,
        telefono: aprendizActualizado.telefono,
        numero_documento: aprendizActualizado.numero_documento,
        usemame: aprendizActualizado.usemame,
        ficha: aprendizActualizado.ficha.numero_ficha,
        programa: aprendizActualizado.programa_formacion.nombre_programa,
        rol: aprendizActualizado.rol.nombre_rol
      }
    });

  } catch (error) {
    console.error('Error al actualizar aprendiz:', error);
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET - Obtener aprendiz específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({
        message: 'ID inválido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El ID debe ser un número válido'
      }, { status: 400 });
    }

    const aprendiz = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        rol: true,
        tipo_documento: true,
        estado_estudiante: true,
        genero: true,
        programa_formacion: true,
        nivel_formacion: true,
        ficha: true,
      }
    });

    if (!aprendiz) {
      return NextResponse.json({
        message: 'Aprendiz no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El aprendiz especificado no existe'
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Aprendiz obtenido correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        id: aprendiz.id_usuario,
        nombre: aprendiz.nombre,
        apellido: aprendiz.apellido,
        correo: aprendiz.correo_electronico,
        telefono: aprendiz.telefono,
        numero_documento: aprendiz.numero_documento,
        usemame: aprendiz.usemame,
        ficha: aprendiz.ficha.numero_ficha,
        programa: aprendiz.programa_formacion.nombre_programa,
        rol: aprendiz.rol.nombre_rol,
        tipo_documento: aprendiz.tipo_documento.nombre_documento,
        estado: aprendiz.estado_estudiante.descripcion_estado,
        genero: aprendiz.genero.descripcion
      }
    });

  } catch (error) {
    console.error('Error al obtener aprendiz:', error);
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// DELETE - Eliminar aprendiz específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({
        message: 'ID inválido',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El ID debe ser un número válido'
      }, { status: 400 });
    }

    // Verificar que el aprendiz existe
    const aprendizExistente = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol: true }
    });

    if (!aprendizExistente) {
      return NextResponse.json({
        message: 'Aprendiz no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El aprendiz especificado no existe'
      }, { status: 404 });
    }

    // Verificar que es un aprendiz
    if (aprendizExistente.rol.nombre_rol !== 'Aprendiz') {
      return NextResponse.json({
        message: 'Usuario no es un aprendiz',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Solo se pueden eliminar aprendices'
      }, { status: 403 });
    }

    // Eliminar el aprendiz
    await prisma.usuario.delete({
      where: { id_usuario: id }
    });

    return NextResponse.json({
      message: 'Aprendiz eliminado exitosamente',
      timestamp: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('Error al eliminar aprendiz:', error);
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
