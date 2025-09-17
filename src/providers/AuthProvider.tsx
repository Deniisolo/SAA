
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  usemame: string;
  correo_electronico: string;
  rol: string;
  telefono?: string;
  numero_documento?: string;
  tipo_documento?: string;
  estado_estudiante?: string;
  genero?: string;
  programa_formacion?: string;
  nivel_formacion?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (usemame: string, contrasenia: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Marcar como montado para evitar problemas de hidratación
    setMounted(true);
    
    // Función para cargar datos de autenticación
    const loadAuthData = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          
          // Asegurar que la cookie también esté presente
          if (!document.cookie.includes('token=')) {
            document.cookie = `token=${storedToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
          }
        } catch {
          // Si hay error al parsear, limpiar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
      setLoading(false);
    };

    // Cargar datos iniciales
    loadAuthData();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        loadAuthData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (usemame: string, contrasenia: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usemame,
          Contrasenia: contrasenia,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.status === 'success') {
        const { token: newToken, user: userData } = data.data;
        
        // Validar que tenemos los datos necesarios
        if (!newToken || !userData) {
          console.error('Datos de respuesta incompletos:', data);
          setLoading(false);
          return false;
        }
        
        // Guardar en localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // También guardar en cookie para el middleware
        document.cookie = `token=${newToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        
        // Actualizar estado inmediatamente
        setToken(newToken);
        setUser(userData);
        setLoading(false);
        
        console.log('Login exitoso:', { 
          tokenLength: newToken.length, 
          userRole: userData.rol,
          userName: userData.nombre 
        });
        
        return true;
      } else {
        console.error('Error en login:', data);
        setLoading(false);
        throw new Error(data.error || data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Limpiar estado
    setToken(null);
    setUser(null);
    
    // Redirigir al login
    window.location.href = '/login';
  };

  const isAuthenticated = !!user && !!token && mounted;
  
  // Debug: Log del estado de autenticación
  useEffect(() => {
    console.log('AuthProvider Debug:', {
      user: !!user,
      token: !!token,
      mounted,
      isAuthenticated,
      loading
    });
  }, [user, token, mounted, isAuthenticated, loading]);

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  const value: AuthContextType = {
    user,
    token,
    loading: loading || !mounted,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Hook para hacer requests autenticados
export function useAuthenticatedFetch() {
  const { token } = useAuth();

  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };
}
