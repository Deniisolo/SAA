'use client'

import { useState } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import Navbar from '../../components/Navbar'

export default function AgregarCompetencias() {
  const { user, hasRole } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Verificar permisos
  if (!hasRole(['admin'])) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="competencias" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </div>
    )
  }

  const competenciasQuimica = [
    {
      nombre_competencia: 'Análisis Químico',
      descripcion: 'Competencia para realizar análisis químicos básicos y avanzados',
      codigo_competencia: 'QUIM001'
    },
    {
      nombre_competencia: 'Razonamiento Cuantitativo',
      descripcion: 'Competencia para aplicar razonamiento matemático en problemas químicos',
      codigo_competencia: 'QUIM002'
    },
    {
      nombre_competencia: 'Ciencias Naturales',
      descripcion: 'Competencia en fundamentos de ciencias naturales aplicadas a la química',
      codigo_competencia: 'QUIM003'
    },
    {
      nombre_competencia: 'Análisis Orgánico',
      descripcion: 'Competencia para realizar análisis de compuestos orgánicos',
      codigo_competencia: 'QUIM004'
    },
    {
      nombre_competencia: 'Análisis Químico Instrumental',
      descripcion: 'Competencia para utilizar instrumentos de análisis químico',
      codigo_competencia: 'QUIM005'
    }
  ]

  const agregarCompetencias = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const promises = competenciasQuimica.map(async (competencia) => {
        const response = await fetch('/api/competencias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(competencia),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al crear competencia')
        }

        return response.json()
      })

      const results = await Promise.all(promises)
      setMessage(`✅ Se agregaron ${results.length} competencias de química correctamente`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="competencias" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agregar Competencias de Química</h1>
          <p className="text-gray-600">Agrega las competencias específicas del área de química al sistema</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Competencias de Química</h2>
          
          <div className="space-y-3 mb-6">
            {competenciasQuimica.map((competencia, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{competencia.nombre_competencia}</h3>
                    <p className="text-sm text-gray-600">{competencia.descripcion}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {competencia.codigo_competencia}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={agregarCompetencias}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Agregando competencias...' : 'Agregar Competencias de Química'}
          </button>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
          <div className="text-gray-600 space-y-2">
            <p>• Estas competencias son específicas para programas de química</p>
            <p>• Cada competencia tiene un código único (QUIM001 - QUIM005)</p>
            <p>• Después de agregarlas, podrás asociarlas con fichas específicas</p>
            <p>• Los instructores podrán crear clases para estas competencias</p>
          </div>
        </div>
      </div>
    </div>
  )
}
