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
        Rol_id_Rol: 3, // Aprendiz
        TipoDocumento_id_Tipo_Documento: tipoDocumentoMap[tipoDocumento] || 1,
        EstadoEstudiante_id_estado_estudiante: 1, // Activo
        Ficha_id_ficha: fichaEncontrada.id_ficha,
        Genero_id_genero: generoMap[genero] || 1,
        Programa_formacion_idPrograma_formacion: fichaEncontrada.id_programa_formacion,
        Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TÉCNICO'
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

    // Generar imagen QR y enviar email (en paralelo para mejor rendimiento)
    try {
      const [qrImage] = await Promise.all([
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
        codigo_qr: aprendizConQR.codigo_qr
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
    const where: any = {
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
