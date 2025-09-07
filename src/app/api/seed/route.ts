import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

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
        { nombre_rol: 'Administrador' },
        { nombre_rol: 'Instructor' },
        { nombre_rol: 'Aprendiz' },
        { nombre_rol: 'Coordinador' }
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

    // Crear usuarios de prueba
    const usuarios = await prisma.usuario.createMany({
      data: [
        {
          nombre: 'Juan Carlos',
          apellido: 'Pérez González',
          correo_electronico: 'juan.perez@example.com',
          telefono: '3001234567',
          numero_documento: '12345678',
          usemame: 'juan.perez',
          Contrasenia: 'password123',
          Rol_id_Rol: 3, // Aprendiz
          TipoDocumento_id_Tipo_Documento: 1, // CC
          EstadoEstudiante_id_estado_estudiante: 1, // Activo
          Ficha_id_ficha: 1,
          Genero_id_genero: 1, // Masculino
          Programa_formacion_idPrograma_formacion: 1, // Técnico en Sistemas
          Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TÉCNICO'
        },
        {
          nombre: 'María Fernanda',
          apellido: 'Rodríguez López',
          correo_electronico: 'maria.rodriguez@example.com',
          telefono: '3009876543',
          numero_documento: '87654321',
          usemame: 'maria.rodriguez',
          Contrasenia: 'password123',
          Rol_id_Rol: 3, // Aprendiz
          TipoDocumento_id_Tipo_Documento: 1, // CC
          EstadoEstudiante_id_estado_estudiante: 1, // Activo
          Ficha_id_ficha: 2,
          Genero_id_genero: 2, // Femenino
          Programa_formacion_idPrograma_formacion: 2, // Técnico en Administración
          Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TÉCNICO'
        },
        {
          nombre: 'Carlos Andrés',
          apellido: 'García Martínez',
          correo_electronico: 'carlos.garcia@example.com',
          telefono: '3005555555',
          numero_documento: '11223344',
          usemame: 'carlos.garcia',
          Contrasenia: 'password123',
          Rol_id_Rol: 2, // Instructor
          TipoDocumento_id_Tipo_Documento: 1, // CC
          EstadoEstudiante_id_estado_estudiante: 1, // Activo
          Ficha_id_ficha: 3,
          Genero_id_genero: 1, // Masculino
          Programa_formacion_idPrograma_formacion: 3, // Tecnólogo en Desarrollo
          Nivel_de_formacion_Id_Nivel_de_formacioncol: 'TECNÓLOGO'
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
        usuarios: usuarios.count,
        total: tiposDocumento.count + roles.count + estadosEstudiante.count + 
               generos.count + nivelesFormacion.count + programasFormacion.count + 
               fichas.count + usuarios.count
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
