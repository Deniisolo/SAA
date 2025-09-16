'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallback = null 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // No hacer nada mientras está cargando
    if (loading) return

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Si se requieren roles específicos, verificar permisos
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.rol)
      if (!hasRequiredRole) {
        router.push('/access-denied')
        return
      }
    }
  }, [isAuthenticated, loading, user, requiredRoles, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return fallback
  }

  // Si se requieren roles específicos y no los tiene, no mostrar nada
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.rol)) {
    return fallback
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>
}
