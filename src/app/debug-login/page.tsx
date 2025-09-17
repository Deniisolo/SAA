'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useRouter } from 'next/navigation'

export default function DebugLogin() {
  const { user, token, isAuthenticated, loading, login, logout } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('SAA_Admin_2024!')
  const [loginResult, setLoginResult] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      user: !!user,
      token: !!token,
      isAuthenticated,
      loading,
      userData: user,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      cookies: typeof document !== 'undefined' ? document.cookie : 'No disponible',
      timestamp: new Date().toISOString()
    })
  }, [user, token, isAuthenticated, loading])

  const handleTestLogin = async () => {
    setLoginResult('Iniciando login...')
    try {
      const result = await login(username, password)
      setLoginResult(result ? 'Login exitoso' : 'Login falló')
      
      // Esperar un momento para que se actualice el estado
      setTimeout(() => {
        setDebugInfo({
          user: !!user,
          token: !!token,
          isAuthenticated,
          loading,
          userData: user,
          tokenPreview: token ? token.substring(0, 20) + '...' : null,
          cookies: typeof document !== 'undefined' ? document.cookie : 'No disponible',
          timestamp: new Date().toISOString()
        })
      }, 1000)
    } catch (error) {
      setLoginResult(`Error: ${error}`)
    }
  }

  const handleRedirect = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Login y Redirección</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Estado actual */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado de Autenticación</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
              <p><strong>Autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
              <p><strong>Token:</strong> {token ? 'Presente' : 'Ausente'}</p>
              <p><strong>Usuario:</strong> {user ? user.nombre : 'Ninguno'}</p>
              <p><strong>Rol:</strong> {user?.rol || 'N/A'}</p>
            </div>
          </div>

          {/* Test de login */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test de Login</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleTestLogin}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Probar Login
              </button>
              {loginResult && (
                <p className={`text-sm ${loginResult.includes('exitoso') ? 'text-green-600' : 'text-red-600'}`}>
                  {loginResult}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de debug */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información de Debug</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex justify-center space-x-4">
          {isAuthenticated && (
            <>
              <button
                onClick={handleRedirect}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Ir a Dashboard
              </button>
              <button
                onClick={logout}
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>

        {/* Credenciales */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Credenciales de Prueba:</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>Admin:</strong> admin / SAA_Admin_2024!</li>
            <li><strong>Instructor:</strong> instructor / SAA_Instructor_2024!</li>
            <li><strong>Coordinador:</strong> coordinador / SAA_Coord_2024!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

