'use client'

import { useState, useEffect, useCallback } from 'react'
import SemáforoAsistencia from '../components/SemáforoAsistencia'
import Navbar from './components/Navbar'
import { EstadoAsistencia } from '../lib/asistencia-utils'
import EstadisticasAprendices from '../components/EstadisticasAprendices'
import ChatWidget from './components/ChatWidget'

interface Competencia {
  id_competencia: number
  nombre_competencia: string
  codigo_competencia: string
  total_clases: number
}

interface Asistencia {
  id_asistencia: number
  fecha_asistencia: string
  hora_registro: string | null
  estado_asistencia: EstadoAsistencia
  id_usuario: number
  nombre: string
  apellido: string
  numero_documento: string
  id_clase: number
  nombre_clase: string
  fecha_clase: string
  hora_inicio: string
  hora_fin: string
  id_competencia: number
  nombre_competencia: string
  codigo_competencia: string
}

export default function HomePage() {
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<string>('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('')

  // Cargar competencias disponibles
  const cargarCompetencias = async () => {
    try {
      const response = await fetch('/api/competencias-disponibles')
      const data = await response.json()
      
      if (response.ok) {
        setCompetencias(data.data || [])
      } else {
        setError('Error al cargar las competencias')
      }
    } catch {
      setError('Error de conexión al cargar competencias')
    }
  }

  // Cargar asistencias con filtros
  const cargarAsistencias = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (competenciaSeleccionada) {
        params.append('competencia', competenciaSeleccionada)
      }
      if (fechaSeleccionada) {
        params.append('fecha', fechaSeleccionada)
      }

      const response = await fetch(`/api/asistencias-filtradas?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setAsistencias(data.data || [])
      } else {
        setError('Error al cargar las asistencias')
      }
    } catch {
      setError('Error de conexión al cargar asistencias')
    } finally {
      setLoading(false)
    }
  }, [competenciaSeleccionada, fechaSeleccionada])

  // Efectos
  useEffect(() => {
    cargarCompetencias()
  }, [])

  useEffect(() => {
    cargarAsistencias()
  }, [cargarAsistencias])

  // Estadísticas
  const estadisticas = {
    total: asistencias.length,
    presentes: asistencias.filter(a => a.estado_asistencia === 'presente').length,
    tardanzas: asistencias.filter(a => a.estado_asistencia === 'tardanza').length,
    ausentes: asistencias.filter(a => a.estado_asistencia === 'ausente').length
  }

  const porcentajeAsistencia = estadisticas.total > 0 
    ? Math.round(((estadisticas.presentes + estadisticas.tardanzas) / estadisticas.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="home" />

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🚦 Control de Asistencia
          </h2>
          <p className="text-gray-600">
            Visualiza el estado de asistencia de los estudiantes con el sistema de semáforo
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competencia
              </label>
              <select
                value={competenciaSeleccionada}
                onChange={(e) => setCompetenciaSeleccionada(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las competencias</option>
                {competencias.map((comp) => (
                  <option key={comp.id_competencia} value={comp.id_competencia}>
                    {comp.nombre_competencia} ({comp.codigo_competencia})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Clase
              </label>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={cargarAsistencias}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Presentes</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.presentes}</p>
              </div>
              <SemáforoAsistencia estado="presente" tamaño="sm" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tardanzas</p>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.tardanzas}</p>
              </div>
              <SemáforoAsistencia estado="tardanza" tamaño="sm" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ausentes</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.ausentes}</p>
              </div>
              <SemáforoAsistencia estado="ausente" tamaño="sm" />
            </div>
          </div>
        </div>

        {/* Lista de Asistencias */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Lista de Asistencias
              {porcentajeAsistencia > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({porcentajeAsistencia}% de asistencia)
                </span>
              )}
            </h3>
          </div>
          
          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={cargarAsistencias}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando asistencias...</p>
            </div>
          ) : asistencias.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No se encontraron asistencias con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Competencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora Clase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora Llegada
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {asistencias.map((asistencia) => (
                    <tr key={asistencia.id_asistencia} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SemáforoAsistencia estado={asistencia.estado_asistencia} tamaño="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {asistencia.nombre.charAt(0)}{asistencia.apellido.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {asistencia.nombre} {asistencia.apellido}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asistencia.numero_documento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asistencia.nombre_competencia}</div>
                        <div className="text-sm text-gray-500">{asistencia.codigo_competencia}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asistencia.nombre_clase}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(asistencia.fecha_clase).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asistencia.hora_inicio} - {asistencia.hora_fin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asistencia.hora_registro ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            asistencia.estado_asistencia === 'presente' 
                              ? 'bg-green-100 text-green-800' 
                              : asistencia.estado_asistencia === 'tardanza'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {asistencia.hora_registro}
                          </span>
                        ) : (
                          <span className="text-red-600 text-xs font-medium">No registrada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sección de Estadísticas */}
        <div className="mt-8">
          <EstadisticasAprendices asistencias={asistencias} />
        </div>
      </main>

      {/* Chatbot Asistín */}
      <ChatWidget 
        label="Hola, soy Asistín!" 
        className="fixed bottom-6 right-6 z-40" 
      />
    </div>
  )
}