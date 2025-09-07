import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest, ROLES } from './lib/auth';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/admin',
  '/estadisticas',
  '/crear-aprendiz',
  '/modificar-aprendiz'
];

// Rutas que solo pueden acceder instructores y coordinadores
const instructorRoutes = [
  '/admin',
  '/estadisticas',
  '/crear-aprendiz',
  '/modificar-aprendiz'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Extraer token del header Authorization
  const token = extractTokenFromRequest(request);

    if (!token) {
      // Redirigir al landing si no hay token
      const landingUrl = new URL('/landing', request.url);
      landingUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(landingUrl);
    }

  // Verificar token
  const user = verifyToken(token);

  if (!user) {
    // Redirigir al landing si el token es inválido
    const landingUrl = new URL('/landing', request.url);
    landingUrl.searchParams.set('redirect', pathname);
    landingUrl.searchParams.set('error', 'token_invalid');
    return NextResponse.redirect(landingUrl);
  }

  // Verificar si la ruta requiere roles específicos
  const isInstructorRoute = instructorRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isInstructorRoute) {
    const allowedRoles = [ROLES.INSTRUCTOR, ROLES.COORDINADOR];
    if (!allowedRoles.includes(user.rol as any)) {
      // Redirigir a página de acceso denegado
      const deniedUrl = new URL('/access-denied', request.url);
      return NextResponse.redirect(deniedUrl);
    }
  }

  // Agregar información del usuario a los headers para uso en las páginas
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id.toString());
  requestHeaders.set('x-user-role', user.rol);
  requestHeaders.set('x-user-name', user.nombre);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
