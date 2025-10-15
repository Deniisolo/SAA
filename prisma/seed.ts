import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Datos base: roles, tipos, estados, géneros, niveles (mínimos para relaciones)
  const [rolAprendiz, rolInstructor] = await Promise.all([
    prisma.rol.upsert({
      where: { id_Rol: 1 },
      update: {},
      create: { nombre_rol: 'aprendiz' }
    }),
    prisma.rol.upsert({
      where: { id_Rol: 2 },
      update: {},
      create: { nombre_rol: 'instructor' }
    })
  ])

  const [tdCC] = await Promise.all([
    prisma.tipoDocumento.upsert({
      where: { id_Tipo_Documento: 1 },
      update: {},
      create: { nombre_documento: 'Cédula', TipoDocumentocol: 'CC' }
    })
  ])

  const [estadoActivo] = await Promise.all([
    prisma.estadoEstudiante.upsert({
      where: { id_estado_estudiante: 1 },
      update: {},
      create: { descripcion_estado: 'Activo' }
    })
  ])

  const [generoM] = await Promise.all([
    prisma.genero.upsert({
      where: { id_genero: 1 },
      update: {},
      create: { descripcion: 'Masculino' }
    })
  ])

  const [nivelTec] = await Promise.all([
    prisma.nivelFormacion.upsert({
      where: { Id_Nivel_de_formacioncol: 'TEC' },
      update: {},
      create: { Id_Nivel_de_formacioncol: 'TEC' }
    })
  ])

  const prog = await prisma.programaFormacion.upsert({
    where: { idPrograma_formacion: 1 },
    update: {},
    create: { nombre_programa: 'ADSO', nivel_formacion: 'Técnologo' }
  })

  const ficha = await prisma.ficha.upsert({
    where: { id_ficha: 1 },
    update: {},
    create: { numero_ficha: '2758445', id_programa_formacion: prog.idPrograma_formacion }
  })

  // Usuarios
  const instructor = await prisma.usuario.upsert({
    where: { id_usuario: 1 },
    update: {},
    create: {
      nombre: 'Carlos',
      apellido: 'Pérez',
      correo_electronico: 'carlos.perez@example.com',
      telefono: '3000000000',
      numero_documento: '10000001',
      usemame: 'cperez',
      Contrasenia: 'hashedpassword',
      codigo_qr: null,
      Rol_id_Rol: rolInstructor.id_Rol,
      TipoDocumento_id_Tipo_Documento: tdCC.id_Tipo_Documento,
      EstadoEstudiante_id_estado_estudiante: estadoActivo.id_estado_estudiante,
      Ficha_id_ficha: ficha.id_ficha,
      Genero_id_genero: generoM.id_genero,
      Programa_formacion_idPrograma_formacion: prog.idPrograma_formacion,
      Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelTec.Id_Nivel_de_formacioncol
    }
  })

  const aprendiz1 = await prisma.usuario.upsert({
    where: { id_usuario: 2 },
    update: {},
    create: {
      nombre: 'Ana',
      apellido: 'Gómez',
      correo_electronico: 'ana.gomez@example.com',
      telefono: '3000000001',
      numero_documento: '10000002',
      usemame: 'agomez',
      Contrasenia: 'hashedpassword',
      codigo_qr: null,
      Rol_id_Rol: rolAprendiz.id_Rol,
      TipoDocumento_id_Tipo_Documento: tdCC.id_Tipo_Documento,
      EstadoEstudiante_id_estado_estudiante: estadoActivo.id_estado_estudiante,
      Ficha_id_ficha: ficha.id_ficha,
      Genero_id_genero: generoM.id_genero,
      Programa_formacion_idPrograma_formacion: prog.idPrograma_formacion,
      Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelTec.Id_Nivel_de_formacioncol
    }
  })

  const aprendiz2 = await prisma.usuario.upsert({
    where: { id_usuario: 3 },
    update: {},
    create: {
      nombre: 'Luis',
      apellido: 'Martínez',
      correo_electronico: 'luis.martinez@example.com',
      telefono: '3000000002',
      numero_documento: '10000003',
      usemame: 'lmartinez',
      Contrasenia: 'hashedpassword',
      codigo_qr: null,
      Rol_id_Rol: rolAprendiz.id_Rol,
      TipoDocumento_id_Tipo_Documento: tdCC.id_Tipo_Documento,
      EstadoEstudiante_id_estado_estudiante: estadoActivo.id_estado_estudiante,
      Ficha_id_ficha: ficha.id_ficha,
      Genero_id_genero: generoM.id_genero,
      Programa_formacion_idPrograma_formacion: prog.idPrograma_formacion,
      Nivel_de_formacion_Id_Nivel_de_formacioncol: nivelTec.Id_Nivel_de_formacioncol
    }
  })

  // Competencias
  const compWeb = await prisma.competencia.upsert({
    where: { id_competencia: 1 },
    update: {},
    create: {
      nombre_competencia: 'Desarrollo Web',
      descripcion: 'HTML, CSS, JavaScript y frameworks',
      codigo_competencia: 'WEB-101'
    }
  })

  const compDB = await prisma.competencia.upsert({
    where: { id_competencia: 2 },
    update: {},
    create: {
      nombre_competencia: 'Bases de Datos',
      descripcion: 'Modelado, SQL, rendimiento',
      codigo_competencia: 'DB-201'
    }
  })

  // Asociar competencias a ficha
  await prisma.competenciaFicha.upsert({
    where: { id_competencia_ficha: 1 },
    update: {},
    create: { id_competencia: compWeb.id_competencia, id_ficha: ficha.id_ficha }
  })
  await prisma.competenciaFicha.upsert({
    where: { id_competencia_ficha: 2 },
    update: {},
    create: { id_competencia: compDB.id_competencia, id_ficha: ficha.id_ficha }
  })

  // Clases
  const hoy = new Date()
  const claseWeb = await prisma.clase.upsert({
    where: { id_clase: 1 },
    update: {},
    create: {
      nombre_clase: 'Intro a HTML y CSS',
      descripcion: 'Estructura y estilos básicos',
      fecha_clase: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
      hora_inicio: '08:00',
      hora_fin: '10:00',
      id_competencia: compWeb.id_competencia,
      id_instructor: instructor.id_usuario
    }
  })

  const claseDB = await prisma.clase.upsert({
    where: { id_clase: 2 },
    update: {},
    create: {
      nombre_clase: 'Modelado Relacional',
      descripcion: 'Diseño de esquemas y normalización',
      fecha_clase: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1),
      hora_inicio: '10:00',
      hora_fin: '12:00',
      id_competencia: compDB.id_competencia,
      id_instructor: instructor.id_usuario
    }
  })

  // Asistencias
  await prisma.asistencia.upsert({
    where: { id_asistencia: 1 },
    update: {},
    create: {
      id_usuario: aprendiz1.id_usuario,
      id_clase: claseWeb.id_clase,
      estado_asistencia: 'presente',
      hora_registro: '08:05'
    }
  })
  await prisma.asistencia.upsert({
    where: { id_asistencia: 2 },
    update: {},
    create: {
      id_usuario: aprendiz2.id_usuario,
      id_clase: claseWeb.id_clase,
      estado_asistencia: 'tardanza',
      hora_registro: '08:20'
    }
  })
  await prisma.asistencia.upsert({
    where: { id_asistencia: 3 },
    update: {},
    create: {
      id_usuario: aprendiz1.id_usuario,
      id_clase: claseDB.id_clase,
      estado_asistencia: 'ausente',
      hora_registro: null
    }
  })

  console.log('✅ Seed completado')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


