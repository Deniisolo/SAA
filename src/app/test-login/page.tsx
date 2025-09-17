'use client'

import { useState } from 'react'

export default function TestLogin() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
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
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de Login</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Credenciales de Prueba</h2>
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
              onClick={testLogin}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Probando...' : 'Probar Login'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resultado</h2>
            <div className="space-y-2 mb-4">
              <p><strong>Status HTTP:</strong> {result.status}</p>
              <p><strong>Éxito:</strong> {result.ok ? 'Sí' : 'No'}</p>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Credenciales Disponibles:</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>Admin:</strong> admin / admin123</li>
            <li><strong>Instructor:</strong> instructor / 123456</li>
            <li><strong>Coordinador:</strong> coordinador / 123456</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

