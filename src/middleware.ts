import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken, extractTokenFromRequest, ROLES } from './lib/auth';

// Rutas que requieren autenticación
// const protectedRoutes = [
//   '/admin',
//   '/estadisticas',
//   '/crear-aprendiz',
//   '/modificar-aprendiz'
// ];

// Rutas que solo pueden acceder instructores y coordinadores
// const instructorRoutes = [
//   '/admin',
//   '/estadisticas',
//   '/crear-aprendiz',
//   '/modificar-aprendiz'
// ];

export function middleware() {
  // const { pathname } = request.nextUrl;

  // Temporalmente deshabilitar el middleware para rutas protegidas
  // Dejar que el cliente maneje la autenticación
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
