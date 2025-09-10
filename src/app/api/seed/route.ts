import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Poblar la base de datos con datos de prueba
export async function POST() {
  try {
    // Crear tipos de documento
    const tiposDocumento = await prisma.tipoDocumento.createMany({
      data: [
        { nombre_documento: 'Cédula de Ciudadanía', TipoDocumentocol: 'CC' },
        { nombre_documento: 'Tarjeta de Identidad', TipoDocumentocol: 'TI' },
        { nombre_documento: 'Cédula de Extranjería', TipoDocumentocol: 'CE' },
        { nombre_documento: 'Pasaporte', TipoDocumentocol: 'PA' }
      ],
      skipDuplicates: true
    });

    // Crear roles
    const roles = await prisma.rol.createMany({
      data: [
        { nombre_rol: 'admin' },
        { nombre_rol: 'instructor' }
      ],
      skipDuplicates: true
    });

    // Crear estados de estudiante
    const estadosEstudiante = await prisma.estadoEstudiante.createMany({
      data: [
        { descripcion_estado: 'Activo' },
        { descripcion_estado: 'Inactivo' },
        { descripcion_estado: 'Graduado' },
        { descripcion_estado: 'Retirado' },
        { descripcion_estado: 'Suspendido' }
      ],
      skipDuplicates: true
    });

    // Crear géneros
    const generos = await prisma.genero.createMany({
      data: [
        { descripcion: 'Masculino' },
        { descripcion: 'Femenino' },
        { descripcion: 'No binario' },
        { descripcion: 'Prefiero no decir' }
      ],
      skipDuplicates: true
    });

    // Crear niveles de formación
    const nivelesFormacion = await prisma.nivelFormacion.createMany({
      data: [
        { Id_Nivel_de_formacioncol: 'TÉCNICO' },
        { Id_Nivel_de_formacioncol: 'TECNÓLOGO' },
        { Id_Nivel_de_formacioncol: 'AUXILIAR' },
        { Id_Nivel_de_formacioncol: 'OPERARIO' }
      ],
      skipDuplicates: true
    });

    // Crear programas de formación
    const programasFormacion = await prisma.programaFormacion.createMany({
      data: [
        { nombre_programa: 'Técnico en Sistemas', nivel_formacion: 'TÉCNICO' },
        { nombre_programa: 'Técnico en Administración', nivel_formacion: 'TÉCNICO' },
        { nombre_programa: 'Tecnólogo en Desarrollo de Software', nivel_formacion: 'TECNÓLOGO' },
        { nombre_programa: 'Auxiliar en Contabilidad', nivel_formacion: 'AUXILIAR' },
        { nombre_programa: 'Operario en Mantenimiento', nivel_formacion: 'OPERARIO' }
      ],
      skipDuplicates: true
    });

    // Crear fichas
    const fichas = await prisma.ficha.createMany({
      data: [
        { numero_ficha: '2567844', id_programa_formacion: 1 },
        { numero_ficha: '2567845', id_programa_formacion: 2 },
        { numero_ficha: '2567846', id_programa_formacion: 3 },
        { numero_ficha: '2567847', id_programa_formacion: 4 },
        { numero_ficha: '2567848', id_programa_formacion: 5 }
      ],
      skipDuplicates: true
    });

    // Crear competencias
    const competencias = await prisma.competencia.createMany({
      data: [
        {
          nombre_competencia: 'Desarrollo de Software',
          descripcion: 'Competencia para desarrollar aplicaciones de software',
          codigo_competencia: 'COMP001'
        },
        {
          nombre_competencia: 'Bases de Datos',
          descripcion: 'Competencia para diseñar y administrar bases de datos',
          codigo_competencia: 'COMP002'
        },
        {
          nombre_competencia: 'Redes de Computadores',
          descripcion: 'Competencia para configurar y administrar redes',
          codigo_competencia: 'COMP003'
        },
        {
          nombre_competencia: 'Análisis Químico',
          descripcion: 'Competencia para realizar análisis químicos básicos y avanzados',
          codigo_competencia: 'QUIM001'
        },
        {
          nombre_competencia: 'Razonamiento Cuantitativo',
          descripcion: 'Competencia para aplicar razonamiento matemático en problemas químicos',
          codigo_competencia: 'QUIM002'
        },
        {
          nombre_competencia: 'Ciencias Naturales',
          descripcion: 'Competencia en fundamentos de ciencias naturales aplicadas a la química',
          codigo_competencia: 'QUIM003'
        },
        {
          nombre_competencia: 'Análisis Orgánico',
          descripcion: 'Competencia para realizar análisis de compuestos orgánicos',
          codigo_competencia: 'QUIM004'
        },
        {
          nombre_competencia: 'Análisis Químico Instrumental',
          descripcion: 'Competencia para utilizar instrumentos de análisis químico',
          codigo_competencia: 'QUIM005'
        }
      ],
      skipDuplicates: true
    });

    // Crear asociaciones competencia-ficha
    const competenciasFicha = await prisma.competenciaFicha.createMany({
      data: [
        { id_competencia: 1, id_ficha: 1 }, // Desarrollo de Software - Ficha 2567844
        { id_competencia: 2, id_ficha: 1 }, // Bases de Datos - Ficha 2567844
        { id_competencia: 1, id_ficha: 2 }, // Desarrollo de Software - Ficha 2567845
        { id_competencia: 3, id_ficha: 2 }  // Redes - Ficha 2567845
      ],
      skipDuplicates: true
    });

    // Eliminar usuarios existentes
    await prisma.usuario.deleteMany({});

    // Crear usuarios de prueba
    const usuarios = await prisma.usuario.createMany({
      data: [
        // Usuario Admin
        {
          nombre: 'Admin',
          apellido: 'Sistema',
          correo_electronico: 'admin@saa.com',
          telefono: '3005555555',
          numero_documento: '11223344',
          usemame: 'admin',
          Contrasenia: '123456',
          codigo_qr: 'ADMIN001',
          Rol_id_Rol: 1, // Admin
          TipoDocumento_id_Tipo_Documento: 1, // CC
          EstadoEstudiante_id_estado_estudiante: 1, // Activo
          Ficha_id_ficha: 1,
          Genero_id_genero: 1, // Masculino
          Programa_formacion_idPrograma_formacion: 1, // Técnico en Sistemas
          Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TÉCNICO'
        },
        // Usuario Instructor
        {
          nombre: 'Fabian',
          apellido: 'Hernandez',
          correo_electronico: 'fabian.hernandez@example.com',
          telefono: '3005555556',
          numero_documento: '11223345',
          usemame: 'instructor',
          Contrasenia: '123456',
          codigo_qr: 'INST001',
          Rol_id_Rol: 2, // Instructor
          TipoDocumento_id_Tipo_Documento: 1, // CC
          EstadoEstudiante_id_estado_estudiante: 1, // Activo
          Ficha_id_ficha: 1,
          Genero_id_genero: 1, // Masculino
          Programa_formacion_idPrograma_formacion: 1, // Técnico en Sistemas
          Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TÉCNICO'
        },
        // Usuario Aprendiz (para pruebas)
        {
          nombre: 'Juan Carlos',
          apellido: 'Pérez González',
          correo_electronico: 'juan.perez@example.com',
          telefono: '3001234567',
          numero_documento: '12345678',
          usemame: 'aprendiz',
          Contrasenia: '123456',
          codigo_qr: 'APR001',
          Rol_id_Rol: 2, // Instructor (temporal para pruebas)
          TipoDocumento_id_Tipo_Documento: 1, // CC
          EstadoEstudiante_id_estado_estudiante: 1, // Activo
          Ficha_id_ficha: 1,
          Genero_id_genero: 1, // Masculino
          Programa_formacion_idPrograma_formacion: 1, // Técnico en Sistemas
          Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TÉCNICO'
        }
      ],
      skipDuplicates: true
    });

    // Crear clases de ejemplo
    const clases = await prisma.clase.createMany({
      data: [
        {
          nombre_clase: 'Introducción a la Programación',
          descripcion: 'Primera clase del curso de programación',
          fecha_clase: new Date('2024-01-15'),
          hora_inicio: '08:00',
          hora_fin: '12:00',
          id_competencia: 1, // Desarrollo de Software
          id_instructor: 2 // Fabian Hernandez
        },
        {
          nombre_clase: 'Diseño de Bases de Datos',
          descripcion: 'Clase sobre diseño de esquemas de base de datos',
          fecha_clase: new Date('2024-01-16'),
          hora_inicio: '14:00',
          hora_fin: '18:00',
          id_competencia: 2, // Bases de Datos
          id_instructor: 2 // Fabian Hernandez
        }
      ],
      skipDuplicates: true
    });

    return NextResponse.json({
      message: 'Base de datos poblada correctamente',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        tiposDocumento: tiposDocumento.count,
        roles: roles.count,
        estadosEstudiante: estadosEstudiante.count,
        generos: generos.count,
        nivelesFormacion: nivelesFormacion.count,
        programasFormacion: programasFormacion.count,
        fichas: fichas.count,
        competencias: competencias.count,
        competenciasFicha: competenciasFicha.count,
        usuarios: usuarios.count,
        clases: clases.count,
        total: tiposDocumento.count + roles.count + estadosEstudiante.count + 
               generos.count + nivelesFormacion.count + programasFormacion.count + 
               fichas.count + competencias.count + competenciasFicha.count + 
               usuarios.count + clases.count
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al poblar la base de datos',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET - Verificar datos existentes
export async function GET() {
  try {
    const [
      tiposDocumento,
      roles,
      estadosEstudiante,
      generos,
      nivelesFormacion,
      programasFormacion,
      fichas,
      usuarios
    ] = await Promise.all([
      prisma.tipoDocumento.count(),
      prisma.rol.count(),
      prisma.estadoEstudiante.count(),
      prisma.genero.count(),
      prisma.nivelFormacion.count(),
      prisma.programaFormacion.count(),
      prisma.ficha.count(),
      prisma.usuario.count()
    ]);

    return NextResponse.json({
      message: 'Estado de la base de datos',
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        tiposDocumento,
        roles,
        estadosEstudiante,
        generos,
        nivelesFormacion,
        programasFormacion,
        fichas,
        usuarios,
        total: tiposDocumento + roles + estadosEstudiante + generos + 
               nivelesFormacion + programasFormacion + fichas + usuarios
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error al verificar la base de datos',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
