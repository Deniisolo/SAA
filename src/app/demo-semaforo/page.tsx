'use client'

import React, { useState } from 'react'
import SemáforoAsistencia, { EstadisticasSemáforo, SemáforoTabla } from '../../components/SemáforoAsistencia'
import { EstadoAsistencia } from '../../lib/asistencia-utils'

export default function DemoSemáforo() {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoAsistencia>('presente')

  const estados: EstadoAsistencia[] = ['presente', 'tardanza', 'ausente']

  const asistenciasDemo = [
    { id: 1, nombre: 'Juan Pérez', documento: '12345678', estado: 'presente' as EstadoAsistencia, hora: '07:55' },
    { id: 2, nombre: 'María García', documento: '87654321', estado: 'tardanza' as EstadoAsistencia, hora: '08:10' },
    { id: 3, nombre: 'Carlos López', documento: '11223344', estado: 'ausente' as EstadoAsistencia, hora: '08:25' },
    { id: 4, nombre: 'Ana Martínez', documento: '44332211', estado: 'presente' as EstadoAsistencia, hora: '07:58' },
    { id: 5, nombre: 'Luis Rodríguez', documento: '55667788', estado: 'tardanza' as EstadoAsistencia, hora: '08:12' }
  ]

  const estadisticasDemo = {
    total: 5,
    presentes: 2,
    tardanzas: 2,
    ausentes: 1,
    porcentajeAsistencia: 80
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚦 Sistema de Semáforo para Asistencia
          </h1>
          <p className="text-xl text-gray-600">
            Demostración del sistema de colores automático
          </p>
        </div>

        {/* Explicación del Sistema */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">¿Cómo Funciona el Semáforo?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <SemáforoAsistencia estado="presente" tamaño="lg" />
              <h3 className="text-lg font-semibold text-green-800 mt-4">Verde - Presente</h3>
              <p className="text-green-700 mt-2">
                El estudiante llegó a tiempo o antes de la hora de inicio de la clase
              </p>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <SemáforoAsistencia estado="tardanza" tamaño="lg" />
              <h3 className="text-lg font-semibold text-yellow-800 mt-4">Amarillo - Tardanza</h3>
              <p className="text-yellow-700 mt-2">
                El estudiante llegó tarde pero dentro de los 15 minutos de tolerancia
              </p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
              <SemáforoAsistencia estado="ausente" tamaño="lg" />
              <h3 className="text-lg font-semibold text-red-800 mt-4">Rojo - Ausente</h3>
              <p className="text-red-700 mt-2">
                El estudiante llegó muy tarde (más de 15 minutos) o no se registró
              </p>
            </div>
          </div>
        </div>

        {/* Selector Interactivo */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Selector Interactivo</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {estados.map((estado) => (
              <button
                key={estado}
                onClick={() => setEstadoSeleccionado(estado)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  estadoSeleccionado === estado
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Estado Seleccionado:</h3>
            <div className="flex items-center gap-4">
              <SemáforoAsistencia estado={estadoSeleccionado} tamaño="lg" />
              <div>
                <p className="text-gray-700">
                  <strong>Estado:</strong> {estadoSeleccionado}
                </p>
                <p className="text-gray-600 text-sm">
                  Este es el estado que se asignaría automáticamente al estudiante
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Ejemplo */}
        <div className="mb-8">
          <EstadisticasSemáforo
            total={estadisticasDemo.total}
            presentes={estadisticasDemo.presentes}
            tardanzas={estadisticasDemo.tardanzas}
            ausentes={estadisticasDemo.ausentes}
            porcentajeAsistencia={estadisticasDemo.porcentajeAsistencia}
          />
        </div>

        {/* Tabla de Asistencias de Ejemplo */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Lista de Asistencias de Ejemplo</h2>
            <p className="text-gray-600 mt-2">Tabla con el sistema de semáforo integrado</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-6 py-4 text-left">Estudiante</th>
                  <th className="px-6 py-4 text-left">Documento</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-left">Hora de Registro</th>
                </tr>
              </thead>
              <tbody>
                {asistenciasDemo.map((asistencia) => (
                  <tr key={asistencia.id} className="even:bg-gray-50 hover:bg-gray-100">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {asistencia.nombre}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {asistencia.documento}
                    </td>
                    <td className="px-6 py-4">
                      <SemáforoTabla 
                        estado={asistencia.estado}
                        horaRegistro={asistencia.hora}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {asistencia.hora}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Información Técnica */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Información Técnica</h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>Tolerancia:</strong> 15 minutos después de la hora de inicio</p>
            <p>• <strong>Determinación Automática:</strong> El sistema calcula el estado basado en la hora de registro</p>
            <p>• <strong>Colores:</strong> Verde (#10B981), Amarillo (#F59E0B), Rojo (#EF4444)</p>
            <p>• <strong>Integración:</strong> Funciona con escáner QR y registro manual</p>
          </div>
        </div>
      </div>
    </div>
  )
}
