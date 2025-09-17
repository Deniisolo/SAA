'use client'

import { useAuth } from '../../providers/AuthProvider'
import { useState } from 'react'

export default function DebugAuth() {
  const { user, token, isAuthenticated, loading, login, logout } = useAuth()
  const [testUsername, setTestUsername] = useState('admin')
  const [testPassword, setTestPassword] = useState('admin123')
  const [loginResult, setLoginResult] = useState<string>('')

  const handleTestLogin = async () => {
    setLoginResult('Intentando login...')
    const result = await login(testUsername, testPassword)
    setLoginResult(result ? 'Login exitoso' : 'Login falló')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Autenticación</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Estado actual */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado Actual</h2>
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
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password:</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
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

        {/* Información del usuario */}
        {user && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {/* Botón de logout */}
        {isAuthenticated && (
          <div className="mt-8 text-center">
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        )}

        {/* Cookies actuales */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cookies Actuales</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {typeof document !== 'undefined' ? document.cookie : 'No disponible en SSR'}
          </pre>
        </div>
      </div>
    </div>
  )
}

