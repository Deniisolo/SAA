import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET() {
  try {
    // Prueba simple de conexión
    const result = await prisma.$queryRaw`SELECT COUNT(*) as total FROM asistencia`
    console.log('Test DB - Total asistencias:', result)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conexión a DB OK',
      data: result 
    })
  } catch (error) {
    console.error('Error en test DB:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
