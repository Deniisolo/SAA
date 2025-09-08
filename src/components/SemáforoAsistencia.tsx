'use client'

import React from 'react'
import { 
  EstadoAsistencia, 
  obtenerColorSemáforo, 
  obtenerClaseColorSemáforo, 
  obtenerTextoEstado, 
  obtenerEmojiSemáforo 
} from '../lib/asistencia-utils'

interface SemáforoAsistenciaProps {
  estado: EstadoAsistencia
  tamaño?: 'sm' | 'md' | 'lg'
  mostrarTexto?: boolean
  mostrarEmoji?: boolean
  className?: string
}

export default function SemáforoAsistencia({
  estado,
  tamaño = 'md',
  mostrarTexto = true,
  mostrarEmoji = true,
  className = ''
}: SemáforoAsistenciaProps) {
  const color = obtenerColorSemáforo(estado)
  const claseColor = obtenerClaseColorSemáforo(estado)
  const texto = obtenerTextoEstado(estado)
  const emoji = obtenerEmojiSemáforo(estado)

  const tamaños = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  }

  const tamañosTexto = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Indicador visual del semáforo */}
      <div className="flex items-center gap-1">
        <div 
          className={`${tamaños[tamaño]} ${claseColor} rounded-full shadow-sm`}
          style={{ backgroundColor: color }}
          title={texto}
        />
        {mostrarEmoji && (
          <span className={`${tamañosTexto[tamaño]}`}>
            {emoji}
          </span>
        )}
      </div>
      
      {/* Texto del estado */}
      {mostrarTexto && (
        <span className={`${tamañosTexto[tamaño]} font-medium text-gray-700`}>
          {texto}
        </span>
      )}
    </div>
  )
}

/**
 * Componente para mostrar estadísticas de asistencia con semáforo
 */
interface EstadisticasSemáforoProps {
  total: number
  presentes: number
  tardanzas: number
  ausentes: number
  porcentajeAsistencia: number
  className?: string
}

export function EstadisticasSemáforo({
  total,
  presentes,
  tardanzas,
  ausentes,
  porcentajeAsistencia,
  className = ''
}: EstadisticasSemáforoProps) {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Estadísticas de Asistencia</h3>
      
      {/* Barra de progreso general */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Asistencia General</span>
          <span className="text-sm font-bold text-gray-800">{porcentajeAsistencia}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${porcentajeAsistencia}%` }}
          />
        </div>
      </div>

      {/* Desglose por estados */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <SemáforoAsistencia estado="presente" tamaño="lg" mostrarTexto={false} />
          <div className="mt-1">
            <div className="text-lg font-bold text-green-600">{presentes}</div>
            <div className="text-xs text-gray-500">Presentes</div>
          </div>
        </div>
        
        <div className="text-center">
          <SemáforoAsistencia estado="tardanza" tamaño="lg" mostrarTexto={false} />
          <div className="mt-1">
            <div className="text-lg font-bold text-yellow-600">{tardanzas}</div>
            <div className="text-xs text-gray-500">Tardanzas</div>
          </div>
        </div>
        
        <div className="text-center">
          <SemáforoAsistencia estado="ausente" tamaño="lg" mostrarTexto={false} />
          <div className="mt-1">
            <div className="text-lg font-bold text-red-600">{ausentes}</div>
            <div className="text-xs text-gray-500">Ausentes</div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-center">
        <span className="text-sm text-gray-600">Total de estudiantes: </span>
        <span className="text-sm font-bold text-gray-800">{total}</span>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar el semáforo en una tabla
 */
interface SemáforoTablaProps {
  estado: EstadoAsistencia
  horaRegistro?: string
  className?: string
}

export function SemáforoTabla({ estado, horaRegistro, className = '' }: SemáforoTablaProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SemáforoAsistencia estado={estado} tamaño="sm" mostrarTexto={false} />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-700">
          {obtenerTextoEstado(estado)}
        </span>
        {horaRegistro && (
          <span className="text-xs text-gray-500">
            {horaRegistro}
          </span>
        )}
      </div>
    </div>
  )
}
