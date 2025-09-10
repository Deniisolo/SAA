'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'

function LandingPageContent() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Si está autenticado, redirigir a la página principal
    if (!loading && isAuthenticated) {
      router.push('/')
    }
    // Si no está autenticado, redirigir al login con parámetros
    else if (!loading && !isAuthenticated) {
      const redirect = searchParams.get('redirect')
      const error = searchParams.get('error')
      
      let loginUrl = '/login'
      if (redirect) {
        loginUrl += `?redirect=${encodeURIComponent(redirect)}`
      }
      if (error) {
        loginUrl += redirect ? '&' : '?'
        loginUrl += `error=${error}`
      }
      
      router.push(loginUrl)
    }
  }, [isAuthenticated, loading, router, searchParams])

  // Mostrar loading mientras se verifica la autenticación
  return <LoadingSpinner message="Redirigiendo..." />
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <LandingPageContent />
    </Suspense>
  )
}
