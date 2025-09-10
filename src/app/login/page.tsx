'use client'

import Image from 'next/image'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../providers/AuthProvider'

function LoginPageContent() {
  const [showPwd, setShowPwd] = useState(false)
  const [usemame, setUsemame] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    // Verificar si hay un error en los parámetros de la URL
    const urlError = searchParams.get('error')
    if (urlError === 'token_invalid') {
      setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
    }
  }, [searchParams])

  useEffect(() => {
    // Si ya está autenticado, redirigir a la página solicitada o a la raíz
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/'
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const success = await login(usemame, contrasenia)
      
      if (success) {
        // El AuthProvider ya maneja la actualización del estado
        // El useEffect se encargará de la redirección
        const redirectTo = searchParams.get('redirect') || '/'
        router.push(redirectTo)
      } else {
        setError('Credenciales inválidas. Intenta nuevamente.')
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Lado izquierdo: ilustración */}
      <div className="relative hidden lg:flex items-center justify-center bg-white">
        <Image
          src="/login-illustration.png"
          alt="Ilustración de laboratorio"
          width={600}
          height={600}
          className="object-contain w-4/5 h-auto"
          priority
        />
      </div>

      {/* Lado derecho: formulario */}
      <div className="flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight mb-8">
            Bienvenido a <span className="text-blue-500 font-extrabold">SAA</span>
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Usuario */}
            <div className="space-y-2">
              <label htmlFor="usemame" className="text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-500" />
                </span>
                <input
                  id="usemame"
                  type="text"
                  value={usemame}
                  onChange={(e) => setUsemame(e.target.value)}
                  required
                  placeholder="Ingresa tu usuario"
                  className="h-12 w-full rounded-xl bg-gray-100 pl-10 pr-4 text-gray-900 placeholder-gray-400 outline-none ring-0 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" />
                </span>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                  required
                  placeholder="•••••••••••••••"
                  className="h-12 w-full rounded-xl bg-gray-100 pl-10 pr-10 text-gray-900 placeholder-gray-400 outline-none ring-0 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Olvidaste tu contraseña */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold shadow-md transition-colors"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}

