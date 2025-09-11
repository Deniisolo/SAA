import { NextRequest, NextResponse } from 'next/server';

// GET - Obtener datos
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name') || 'Usuario';
  
  return NextResponse.json({
    message: `¡Hola ${name}!`,
    method: 'GET',
    timestamp: new Date().toISOString(),
    status: 'success',
    data: {
      id: 1,
      name: name,
      description: 'Esta es una API de prueba'
    }
  });
}

// POST - Crear datos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Datos recibidos correctamente',
      method: 'POST',
      timestamp: new Date().toISOString(),
      status: 'success',
      receivedData: body
    });
    } catch {
    return NextResponse.json({
      message: 'Error al procesar los datos',
      method: 'POST',
      timestamp: new Date().toISOString(),
      status: 'error',
      error: 'Datos JSON inválidos'
    }, { status: 400 });
  }
}

// PUT - Actualizar datos
export async function PUT(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({
    message: 'Datos actualizados correctamente',
    method: 'PUT',
    timestamp: new Date().toISOString(),
    status: 'success',
    updatedData: body
  });
}

// DELETE - Eliminar datos
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  return NextResponse.json({
    message: `Elemento con ID ${id} eliminado correctamente`,
    method: 'DELETE',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}
