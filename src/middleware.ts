import { NextRequest, NextResponse } from 'next/server';

// NOTA: El middleware corre en entorno Edge. Evitamos usar librerías Node como 'jsonwebtoken'.
// Implementamos utilidades mínimas aquí para no importar desde './lib/auth'.

// Roles disponibles
const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor'
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// Extraer token del header Authorization o de las cookies
function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  return null;
}

// Decodificar payload de un JWT sin verificar firma (suficiente para control de UI y rutas en dev)
function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Añadir padding requerido para base64
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) base64 = base64 + '='.repeat(padding);
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    try {
      // Fallback para entornos donde Buffer no esté disponible
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = 4 - (base64.length % 4);
      if (padding !== 4) base64 = base64 + '='.repeat(padding);
      // atob puede existir en Edge Runtime
      // @ts-ignore
      const json = atob(base64);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}

// Rutas que requieren autenticación
const protectedRoutes = [
  // '/' removido para evitar bucle de redirección
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
]
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/landing', '/simple-login', '/debug-login', '/test-login'];
  
  // Si es una ruta pública, permitir acceso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Si es una ruta protegida, verificar autenticación
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = extractTokenFromRequest(request);

    if (!token) {
      const landingUrl = new URL('/landing', request.url);
      landingUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(landingUrl);
    }

    // Decodificar payload sin verificar firma (middleware en Edge)
    const payload = decodeJwtPayload<{ rol?: Role }>(token);
    if (!payload) {
      const landingUrl = new URL('/landing', request.url);
      landingUrl.searchParams.set('redirect', pathname);
      landingUrl.searchParams.set('error', 'token_invalid');
      return NextResponse.redirect(landingUrl);
    }

    // Verificar permisos para rutas de administrador
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (payload.rol !== ROLES.ADMIN) {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
    }

    // Verificar permisos para rutas de instructor
    if (instructorRoutes.some(route => pathname.startsWith(route))) {
      if (payload.rol !== ROLES.ADMIN && payload.rol !== ROLES.INSTRUCTOR) {
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
