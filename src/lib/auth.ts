import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
const JWT_EXPIRES_IN = '24h';

export interface UserPayload {
  id: number;
  usemame: string;
  nombre: string;
  apellido: string;
  rol: string;
  correo_electronico: string;
}

export interface AuthToken {
  token: string;
  user: UserPayload;
}

// Generar token JWT
export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verificar token JWT
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Extraer token del header Authorization
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Verificar si el usuario tiene el rol requerido
export function hasRole(user: UserPayload, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.rol);
}

// Middleware para verificar autenticación
export function requireAuth(requiredRoles?: string[]) {
  return function(request: NextRequest): { user: UserPayload } | { error: string } {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return { error: 'Token de acceso requerido' };
    }

    const user = verifyToken(token);
    if (!user) {
      return { error: 'Token inválido o expirado' };
    }

    if (requiredRoles && !hasRole(user, requiredRoles)) {
      return { error: 'Permisos insuficientes' };
    }

    return { user };
  };
}

// Roles disponibles
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  INSTRUCTOR: 'Instructor',
  COORDINADOR: 'Coordinador',
  APRENDIZ: 'Aprendiz'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
