'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleLogin() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('SAA_Admin_2024!')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      console.log('Iniciando login con:', { username, password })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usemame: username,
          Contrasenia: password,
        }),
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', data)

      if (response.ok) {
        const { token, user } = data.data
        
        // Guardar en localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Guardar en cookie
        document.cookie = `token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`
        
        setResult({
          success: true,
          message: 'Login exitoso',
          user: user,
          token: token.substring(0, 20) + '...'
        })

        // Redirigir después de un momento
        setTimeout(() => {
          console.log('Redirigiendo a dashboard...')
          router.push('/')
        }, 1000)

      } else {
        setResult({
          success: false,
          message: data.error || 'Error en el login',
          data: data
        })
      }
    } catch (error) {
      console.error('Error en login:', error)
      setResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Login Simplificado</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-md ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.message}
            </h3>
            {result.user && (
              <p className="text-sm text-green-600 mt-2">
                Usuario: {result.user.nombre} {result.user.apellido} ({result.user.rol})
              </p>
            )}
            {result.token && (
              <p className="text-sm text-green-600">
                Token: {result.token}
              </p>
            )}
            {!result.success && (
              <pre className="text-xs text-red-600 mt-2 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Credenciales: admin / SAA_Admin_2024!
          </p>
        </div>
      </div>
    </div>
  )
}

