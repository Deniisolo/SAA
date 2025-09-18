'use client'

import { useState, useEffect } from 'react'
// import { useAuth } from '../../../providers/AuthProvider' // Comentado temporalmente
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../../components/ProtectedRoute'
import SemáforoAsistencia, { EstadisticasSemáforo, SemáforoTabla } from '../../../components/SemáforoAsistencia'
import TestQRScannerMejorado from '../../../components/TestQRScannerMejorado'
import EscánerQRAsistencia from '../../../components/EscánerQRAsistencia'
import EscánerQRMejorado from '../../../components/EscánerQRMejorado'
import ChatWidget from '../../components/ChatWidget'
import { calcularEstadisticasAsistencia, EstadoAsistencia } from '../../../lib/asistencia-utils'

interface Asistencia {
  id_asistencia: number
  fecha_asistencia: string
  estado_asistencia: EstadoAsistencia
  nombre: string
  apellido: string
  numero_documento: string
  nombre_clase: string
  hora_inicio: string
  hora_fin: string
  nombre_competencia: string
}

interface Clase {
  id_clase: number
  nombre_clase: string
  hora_inicio: string
  hora_fin: string
  competencia: {
    nombre_competencia: string
  }
}

function GestionAsistenciaContent() {
  // const { user, hasRole } = useAuth() // Comentado temporalmente
  const [clases, setClases] = useState<Clase[]>([])
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [claseSeleccionada, setClaseSeleccionada] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    presentes: 0,
    tardanzas: 0,
    ausentes: 0,
    porcentajeAsistencia: 0
  })

  const fetchClases = async () => {
    try {
      setLoading(true)
      console.log('📡 Haciendo petición a /api/clases...')
      const response = await fetch('/api/clases')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Clases cargadas:', data.data?.length || 0)
        setClases(data.data || [])
      } else {
        console.error('❌ Error al cargar clases:', response.status)
        setError('Error al cargar las clases')
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchAsistencias = async (idClase: number) => {
    try {
      const response = await fetch(`/api/asistencias/clase/${idClase}`)
      if (response.ok) {
        const data = await response.json()
        setAsistencias(data.data || [])
        
        // Calcular estadísticas
        const stats = calcularEstadisticasAsistencia(data.data || [])
        setEstadisticas(stats)
      } else {
        setError('Error al cargar las asistencias')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const handleAsistenciaRegistrada = (data: {
    success: boolean
    message: string
    data?: {
      asistencia: {
        id_asistencia: number
        id_usuario: number
        id_clase: number
        estado_asistencia: string
        hora_registro: string | null
        fecha_registro: Date
      }
      estado_determinado: string
      hora_registro: string
      hora_inicio_clase: string
    }
  }) => {
    // Recargar las asistencias cuando se registra una nueva
    if (claseSeleccionada) {
      fetchAsistencias(claseSeleccionada)
    }
  }

  const handleError = (error: string) => {
    setError(error)
  }

  useEffect(() => {
    // Cargar clases sin verificar permisos para pruebas
    console.log('🔍 Cargando clases...')
    fetchClases()
  }, [])

  useEffect(() => {
    if (claseSeleccionada) {
      fetchAsistencias(claseSeleccionada)
    }
  }, [claseSeleccionada])

  // Comentar verificación de permisos temporalmente para pruebas
  // if (!hasRole(['instructor'])) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <Navbar active="asistencia" />
  //       <div className="container mx-auto px-4 py-8">
  //         <div className="text-center">
  //           <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
  //           <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  const claseActual = clases.find(c => c.id_clase === claseSeleccionada)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="asistencia" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="asistencia" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Gestión de Asistencia con QR</h1>
          <p className="text-gray-600">Escanea los códigos QR de los aprendices para registrar asistencia automáticamente</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}


        {/* Selector de Clase */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📚 Seleccionar Clase</h2>
          {clases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay clases disponibles</p>
              <p className="text-sm">Crea una clase primero en la sección &quot;Gestión de Clases&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clases.map((clase) => (
                <button
                  key={clase.id_clase}
                  onClick={() => {
                    console.log('🎯 Seleccionando clase:', clase.id_clase, clase.nombre_clase)
                    setClaseSeleccionada(clase.id_clase)
                  }}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    claseSeleccionada === clase.id_clase
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{clase.nombre_clase}</h3>
                  <p className="text-sm text-gray-600 mb-1">{clase.competencia.nombre_competencia}</p>
                  <p className="text-sm text-gray-500">
                    🕐 {clase.hora_inicio} - {clase.hora_fin}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">ID: {clase.id_clase}</p>
                  {claseSeleccionada === clase.id_clase && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      ✅ Clase seleccionada
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información de la Clase Seleccionada */}
        {claseActual && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Información de la Clase</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-blue-700">📚 Nombre de la Clase</label>
                <p className="mt-1 text-sm text-blue-900 font-medium">{claseActual.nombre_clase}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <label className="block text-sm font-medium text-green-700">🎯 Competencia</label>
                <p className="mt-1 text-sm text-green-900 font-medium">{claseActual.competencia.nombre_competencia}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <label className="block text-sm font-medium text-purple-700">🕐 Horario</label>
                <p className="mt-1 text-sm text-purple-900 font-medium">
                  {claseActual.hora_inicio} - {claseActual.hora_fin}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Escáner QR de Asistencia */}
        {claseSeleccionada && (
          <div className="mb-6">
            {console.log('📱 Renderizando escáner QR para clase:', claseSeleccionada)}
            <EscánerQRMejorado
              claseSeleccionada={clases.find(c => c.id_clase === claseSeleccionada) || null}
              onAsistenciaRegistrada={handleAsistenciaRegistrada}
            />
          </div>
        )}

        {/* Estadísticas de Asistencia */}
        {claseSeleccionada && (
          <div className="mb-6">
            <EstadisticasSemáforo
              total={estadisticas.total}
              presentes={estadisticas.presentes}
              tardanzas={estadisticas.tardanzas}
              ausentes={estadisticas.ausentes}
              porcentajeAsistencia={estadisticas.porcentajeAsistencia}
            />
          </div>
        )}

        {/* Lista de Asistencias */}
        {claseSeleccionada && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Lista de Asistencias</h2>
            </div>
            
            {asistencias.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay asistencias registradas para esta clase
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-4 py-3 text-left">Estudiante</th>
                      <th className="px-4 py-3 text-left">Documento</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-left">Hora de Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias.map((asistencia) => (
                      <tr key={asistencia.id_asistencia} className="even:bg-gray-50">
                        <td className="px-4 py-3">
                          {asistencia.nombre} {asistencia.apellido}
                        </td>
                        <td className="px-4 py-3">
                          {asistencia.numero_documento}
                        </td>
                        <td className="px-4 py-3">
                          <SemáforoTabla 
                            estado={asistencia.estado_asistencia}
                            horaRegistro={new Date(asistencia.fecha_asistencia).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(asistencia.fecha_asistencia).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Información del Sistema de Semáforo */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Sistema de Semáforo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <SemáforoAsistencia estado="presente" tamaño="sm" />
              <span className="text-blue-800">Llegó a tiempo o antes de la hora de inicio</span>
            </div>
            <div className="flex items-center gap-2">
              <SemáforoAsistencia estado="tardanza" tamaño="sm" />
              <span className="text-blue-800">Llegó tarde pero dentro de los 15 minutos de tolerancia</span>
            </div>
            <div className="flex items-center gap-2">
              <SemáforoAsistencia estado="ausente" tamaño="sm" />
              <span className="text-blue-800">Llegó muy tarde o no se registró asistencia</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chatbot Asistín */}
      <ChatWidget 
        label="Hola, soy Asistín!" 
        className="fixed bottom-6 right-6 z-40" 
      />
    </div>
  )
}

export default function GestionAsistencia() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'instructor']}>
      <GestionAsistenciaContent />
    </ProtectedRoute>
  )
}