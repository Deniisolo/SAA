import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';
import { generarCodigoQR, generarImagenQR } from '../../../lib/qr-utils';
import { enviarEmailBienvenida } from '../../../lib/email-utils';

// POST - Crear nuevo aprendiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      apellido,
      tipoDocumento,
      numeroDocumento,
      genero,
      correo,
      celular,
      ficha,
      clasesSeleccionadas = []
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

    // Verificar si ya existe un usuario con el mismo número de documento
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        numero_documento: numeroDocumento
      }
    });

    if (usuarioExistente) {
      return NextResponse.json({
        message: 'Ya existe un usuario con este número de documento',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El número de documento ya está registrado'
      }, { status: 409 });
    }

    // Verificar si ya existe un usuario con el mismo correo
    const correoExistente = await prisma.usuario.findFirst({
      where: {
        correo_electronico: correo
      }
    });

    if (correoExistente) {
      return NextResponse.json({
        message: 'Ya existe un usuario con este correo electrónico',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El correo electrónico ya está registrado'
      }, { status: 409 });
    }

    // Buscar tipo de documento
    const tipoDocumentoEncontrado = await prisma.tipoDocumento.findFirst({
      where: {
        OR: [
          { nombre_documento: { contains: 'Cédula de Ciudadanía' } },
          { TipoDocumentocol: tipoDocumento }
        ]
      }
    });

    if (!tipoDocumentoEncontrado) {
      return NextResponse.json({
        message: 'Tipo de documento no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El tipo de documento especificado no existe'
      }, { status: 404 });
    }

    // Buscar género
    const generoEncontrado = await prisma.genero.findFirst({
      where: {
        descripcion: genero === 'M' ? 'Masculino' : 'Femenino'
      }
    });

    if (!generoEncontrado) {
      return NextResponse.json({
        message: 'Género no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'El género especificado no existe'
      }, { status: 404 });
    }

    // Buscar estado de estudiante (Activo)
    const estadoEstudiante = await prisma.estadoEstudiante.findFirst({
      where: { descripcion_estado: 'Activo' }
    });

    if (!estadoEstudiante) {
      return NextResponse.json({
        message: 'Estado de estudiante no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'No se encontró el estado de estudiante activo'
      }, { status: 404 });
    }

    // Buscar rol Aprendiz
    const rolAprendiz = await prisma.rol.findFirst({
      where: { nombre_rol: 'Aprendiz' }
    });

    if (!rolAprendiz) {
      return NextResponse.json({
        message: 'Rol Aprendiz no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'No se encontró el rol de Aprendiz'
      }, { status: 404 });
    }

    // Buscar nivel de formación
    const nivelFormacion = await prisma.nivelFormacion.findFirst({
      where: { Id_Nivel_de_formacioncol: 'Tecnólogo' }
    });

    if (!nivelFormacion) {
      return NextResponse.json({
        message: 'Nivel de formación no encontrado',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'No se encontró el nivel de formación'
      }, { status: 404 });
    }

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

    // Crear el nuevo aprendiz primero (sin QR)
    const nuevoAprendiz = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo_electronico: correo.trim(),
        telefono: celular.trim(),
        numero_documento: numeroDocumento.trim(),
        usemame: `${nombre.toLowerCase().replace(/\s+/g, '')}.${apellido.toLowerCase().replace(/\s+/g, '')}`,
        Contrasenia: '123456', // Contraseña por defecto
        Rol_id_Rol: rolAprendiz.id_Rol,
        TipoDocumento_id_Tipo_Documento: tipoDocumentoEncontrado.id_Tipo_Documento,
        EstadoEstudiante_id_estado_estudiante: estadoEstudiante.id_estado_estudiante,
        Ficha_id_ficha: fichaEncontrada.id_ficha,
        Genero_id_genero: generoEncontrado.id_genero,
        Programa_formacion_idPrograma_formacion: fichaEncontrada.id_programa_formacion,
        Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelFormacion.Id_Nivel_de_formacioncol
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

    // Generar código QR único para el aprendiz
    const codigoQR = generarCodigoQR(nuevoAprendiz.id_usuario, nombre.trim(), apellido.trim());
    
    // Actualizar el aprendiz con el código QR
    const aprendizConQR = await prisma.usuario.update({
      where: { id_usuario: nuevoAprendiz.id_usuario },
      data: { codigo_qr: codigoQR },
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

    // Asociar el estudiante a las clases seleccionadas
    if (clasesSeleccionadas && clasesSeleccionadas.length > 0) {
      try {
        const asociaciones = clasesSeleccionadas.map(idClase => ({
          id_usuario: aprendizConQR.id_usuario,
          id_clase: idClase
        }));

        await prisma.estudianteClase.createMany({
          data: asociaciones,
          skipDuplicates: true // Evitar duplicados si ya existe la asociación
        });

        console.log(`Estudiante asociado a ${asociaciones.length} clases`);
      } catch (error) {
        console.error('Error al asociar estudiante a clases:', error);
        // No fallar la creación del usuario por este error
      }
    }

    // Generar imagen QR y enviar email (en paralelo para mejor rendimiento)
    try {
      await Promise.all([
        generarImagenQR(codigoQR),
        enviarEmailBienvenida(
          correo.trim(),
          nombre.trim(),
          apellido.trim(),
          codigoQR,
          '' // Se generará la imagen en la función
        )
      ]);
      
      console.log(`Email enviado exitosamente a ${correo} con QR: ${codigoQR}`);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // No fallar la creación del aprendiz si el email falla
    }

    return NextResponse.json({
      message: 'Aprendiz creado exitosamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        id: aprendizConQR.id_usuario,
        nombre: aprendizConQR.nombre,
        apellido: aprendizConQR.apellido,
        correo: aprendizConQR.correo_electronico,
        telefono: aprendizConQR.telefono,
        numero_documento: aprendizConQR.numero_documento,
        usemame: aprendizConQR.usemame,
        ficha: aprendizConQR.ficha.numero_ficha,
        programa: aprendizConQR.programa_formacion.nombre_programa,
        rol: aprendizConQR.rol.nombre_rol,
        codigo_qr: aprendizConQR.codigo_qr,
        clases_asociadas: clasesSeleccionadas.length
      }
    });

  } catch (error) {
    console.error('Error al crear aprendiz:', error);
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET - Listar aprendices
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const ficha = searchParams.get('ficha') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: {
      rol: {
        nombre_rol: string
      }
      OR?: Array<{
        nombre: { contains: string; mode: 'insensitive' }
      } | {
        apellido: { contains: string; mode: 'insensitive' }
      } | {
        numero_documento: { contains: string }
      } | {
        correo_electronico: { contains: string; mode: 'insensitive' }
      }>
      ficha?: {
        numero_ficha: string
      }
      AND?: Array<{
        ficha?: {
          numero_ficha: string
        }
      }>
    } = {
      rol: {
        nombre_rol: 'Aprendiz'
      }
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { numero_documento: { contains: search } },
        { correo_electronico: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (ficha) {
      where.ficha = {
        numero_ficha: ficha
      };
    }

    // Obtener aprendices con paginación
    const [aprendices, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: {
          rol: true,
          tipo_documento: true,
          estado_estudiante: true,
          genero: true,
          programa_formacion: true,
          nivel_formacion: true,
          ficha: true,
        },
        skip,
        take: limit,
        orderBy: { id_usuario: 'desc' }
      }),
      prisma.usuario.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      message: 'Aprendices obtenidos correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        aprendices: aprendices.map(aprendiz => ({
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
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener aprendices:', error);
    return NextResponse.json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
