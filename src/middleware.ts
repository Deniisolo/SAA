import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest, ROLES } from './lib/auth';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/',
  '/admin',
  '/estadisticas',
  '/crear-aprendiz',
  '/modificar-aprendiz',
  '/instructor',
  '/qr'
];

// Rutas que solo pueden acceder administradores
const adminRoutes = [
  '/admin'
];

// Rutas que solo pueden acceder instructores y administradores
const instructorRoutes = [
  '/instructor',
  '/estadisticas',
  '/crear-aprendiz',
  '/modificar-aprendiz',
  '/qr'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/landing'];
  
  // Si es una ruta pública, permitir acceso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Si es una ruta protegida, verificar autenticación
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      // Redirigir al login si no hay token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = verifyToken(token);
    if (!user) {
      // Redirigir al login si el token es inválido
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar permisos para rutas de administrador
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (user.rol !== ROLES.ADMIN) {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
    }

    // Verificar permisos para rutas de instructor
    if (instructorRoutes.some(route => pathname.startsWith(route))) {
      if (![ROLES.ADMIN, ROLES.INSTRUCTOR].includes(user.rol as any)) {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
    }
  }

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
