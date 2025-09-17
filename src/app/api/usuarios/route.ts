import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Obtener usuarios con paginación - optimizado para solo los campos necesarios
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          correo_electronico: true,
          numero_documento: true,
          rol: {
            select: {
              id_Rol: true,
              nombre_rol: true
            }
          },
          ficha: {
            select: {
              id_ficha: true,
              numero_ficha: true
            }
          },
          estado_estudiante: {
            select: {
              id_estado_estudiante: true,
              descripcion_estado: true
            }
          }
        },
        orderBy: {
          nombre: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.usuario.count()
    ])

    return NextResponse.json({
      success: true,
      data: usuarios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nombre,
      apellido,
      correo_electronico,
      telefono,
      numero_documento,
      usemame,
      Contrasenia,
      codigo_qr,
      Rol_id_Rol,
      TipoDocumento_id_Tipo_Documento,
      EstadoEstudiante_id_estado_estudiante,
      Ficha_id_ficha,
      Genero_id_genero,
      Programa_formacion_idPrograma_formacion,
      Nivel_de_formacion_Id_Nivel_de_formacioncol
    } = body

    // Validar campos requeridos
    if (!nombre || !apellido || !correo_electronico || !usemame || !Contrasenia || !Rol_id_Rol) {
      return NextResponse.json(
        { success: false, error: 'Los campos nombre, apellido, email, username, contraseña y rol son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el username no exista
    const usuarioExistente = await prisma.usuario.findFirst({
      where: { usemame }
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con este username' },
        { status: 400 }
      )
    }

    // Verificar que el email no exista
    const emailExistente = await prisma.usuario.findFirst({
      where: { correo_electronico }
    })

    if (emailExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Preparar datos con valores por defecto para campos obligatorios
    const dataToCreate: any = {
      nombre,
      apellido,
      correo_electronico,
      telefono: telefono || '',
      numero_documento: numero_documento || '',
      usemame,
      Contrasenia,
      codigo_qr: codigo_qr || '',
      Rol_id_Rol: parseInt(Rol_id_Rol),
      Nivel_de_formacion_Id_Nivel_de_formacioncol: Nivel_de_formacion_Id_Nivel_de_formacioncol || 'Tecnólogo',
      // Valores por defecto para campos obligatorios
      TipoDocumento_id_Tipo_Documento: TipoDocumento_id_Tipo_Documento ? parseInt(TipoDocumento_id_Tipo_Documento) : 1,
      EstadoEstudiante_id_estado_estudiante: EstadoEstudiante_id_estado_estudiante ? parseInt(EstadoEstudiante_id_estado_estudiante) : 1,
      Ficha_id_ficha: Ficha_id_ficha ? parseInt(Ficha_id_ficha) : 1,
      Genero_id_genero: Genero_id_genero ? parseInt(Genero_id_genero) : 1,
      Programa_formacion_idPrograma_formacion: Programa_formacion_idPrograma_formacion ? parseInt(Programa_formacion_idPrograma_formacion) : 1
    }

    const usuario = await prisma.usuario.create({
      data: dataToCreate,
      include: {
        rol: true,
        tipo_documento: true,
        estado_estudiante: true,
        ficha: true,
        genero: true,
        programa_formacion: true,
        nivel_formacion: true
      }
    })

    return NextResponse.json({
      success: true,
      data: usuario
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
