import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario inválido' },
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const {
      nombre,
      apellido,
      correo_electronico,
      telefono,
      numero_documento,
      usemame,
      Contrasenia,
      Rol_id_Rol,
      TipoDocumento_id_Tipo_Documento,
      EstadoEstudiante_id_estado_estudiante,
      Ficha_id_ficha,
      Genero_id_genero,
      Programa_formacion_idPrograma_formacion
    } = body

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

    // Verificar que el username no esté en uso por otro usuario
    if (usemame && usemame !== usuarioExistente.usemame) {
      const usernameExistente = await prisma.usuario.findFirst({
        where: { 
          usemame,
          NOT: { id_usuario: id }
        }
      })

      if (usernameExistente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con este username' },
          { status: 400 }
        )
      }
    }

    // Verificar que el email no esté en uso por otro usuario
    if (correo_electronico && correo_electronico !== usuarioExistente.correo_electronico) {
      const emailExistente = await prisma.usuario.findFirst({
        where: { 
          correo_electronico,
          NOT: { id_usuario: id }
        }
      })

      if (emailExistente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con este email' },
          { status: 400 }
        )
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = {
      nombre,
      apellido,
      correo_electronico,
      telefono: telefono || '',
      numero_documento: numero_documento || '',
      usemame,
      Rol_id_Rol: parseInt(Rol_id_Rol),
      TipoDocumento_id_Tipo_Documento: TipoDocumento_id_Tipo_Documento ? parseInt(TipoDocumento_id_Tipo_Documento) : usuarioExistente.TipoDocumento_id_Tipo_Documento,
      EstadoEstudiante_id_estado_estudiante: EstadoEstudiante_id_estado_estudiante ? parseInt(EstadoEstudiante_id_estado_estudiante) : usuarioExistente.EstadoEstudiante_id_estado_estudiante,
      Ficha_id_ficha: Ficha_id_ficha ? parseInt(Ficha_id_ficha) : usuarioExistente.Ficha_id_ficha,
      Genero_id_genero: Genero_id_genero ? parseInt(Genero_id_genero) : usuarioExistente.Genero_id_genero,
      Programa_formacion_idPrograma_formacion: Programa_formacion_idPrograma_formacion ? parseInt(Programa_formacion_idPrograma_formacion) : usuarioExistente.Programa_formacion_idPrograma_formacion
    }

    // Solo actualizar contraseña si se proporciona
    if (Contrasenia && Contrasenia.trim() !== '') {
      dataToUpdate.Contrasenia = Contrasenia
    }

    const usuario = await prisma.usuario.update({
      where: { id_usuario: id },
      data: dataToUpdate,
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario inválido' },
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

    await prisma.usuario.delete({
      where: { id_usuario: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}