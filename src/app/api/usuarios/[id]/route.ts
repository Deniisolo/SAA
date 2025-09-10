import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
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

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: usuario
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam)
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

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id_usuario: id }
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si se está cambiando el username, verificar que no exista otro con el mismo username
    if (usemame && usemame !== usuarioExistente.usemame) {
      const usernameExistente = await prisma.usuario.findFirst({
        where: { 
          usemame,
          id_usuario: { not: id }
        }
      })

      if (usernameExistente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con este username' },
          { status: 400 }
        )
      }
    }

    // Si se está cambiando el email, verificar que no exista otro con el mismo email
    if (correo_electronico && correo_electronico !== usuarioExistente.correo_electronico) {
      const emailExistente = await prisma.usuario.findFirst({
        where: { 
          correo_electronico,
          id_usuario: { not: id }
        }
      })

      if (emailExistente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con este email' },
          { status: 400 }
        )
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        nombre,
        apellido,
        correo_electronico,
        telefono,
        numero_documento,
        usemame,
        Contrasenia,
        codigo_qr,
        Rol_id_Rol: parseInt(Rol_id_Rol),
        TipoDocumento_id_Tipo_Documento: parseInt(TipoDocumento_id_Tipo_Documento),
        EstadoEstudiante_id_estado_estudiante: parseInt(EstadoEstudiante_id_estado_estudiante),
        Ficha_id_ficha: parseInt(Ficha_id_ficha),
        Genero_id_genero: parseInt(Genero_id_genero),
        Programa_formacion_idPrograma_formacion: parseInt(Programa_formacion_idPrograma_formacion),
        Nivel_de_formacion_Id_Nivel_de_formacioncol
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
    })

    return NextResponse.json({
      success: true,
      data: usuario
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        _count: {
          select: {
            clases_instructor: true,
            asistencias: true
          }
        }
      }
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene clases como instructor o asistencias
    if (usuarioExistente._count.clases_instructor > 0 || usuarioExistente._count.asistencias > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un usuario que tiene clases como instructor o asistencias registradas' },
        { status: 400 }
      )
    }

    await prisma.usuario.delete({
      where: { id_usuario: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
