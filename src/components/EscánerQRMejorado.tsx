'use client'

import React, { useState, useRef, useEffect } from 'react'
import QrScanner from 'qr-scanner'
import SemáforoAsistencia from './SemáforoAsistencia'
import { EstadoAsistencia } from '../lib/asistencia-utils'

interface EscánerQRMejoradoProps {
  idClase: number
  onAsistenciaRegistrada: (data: {
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
  }) => void
  onError: (error: string) => void
}

export default function EscánerQRMejorado({ 
  idClase, 
  onAsistenciaRegistrada, 
  onError 
}: EscánerQRMejoradoProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [ultimaAsistencia, setUltimaAsistencia] = useState<{
    asistencia: {
      id_asistencia: number
      id_usuario: number
      id_clase: number
      estado_asistencia: string
      hora_registro: string | null
      fecha_registro: Date
      nombre: string
      apellido: string
    }
    estado_determinado: string
    hora_registro: string
    hora_inicio_clase: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [codigoManual, setCodigoManual] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  const iniciarEscáner = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Esperar un poco para asegurar que el video esté renderizado
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!videoRef.current) {
        throw new Error('Elemento de video no disponible. Intenta recargar la página.')
      }

      console.log('Creando instancia de QrScanner...')

      // Crear instancia de QrScanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('🎯 QR detectado con qr-scanner:', result.data)
          procesarCodigoQR(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      )

      console.log('Iniciando escáner...')
      // Iniciar el escáner
      await qrScannerRef.current.start()
      console.log('✅ Escáner QR iniciado correctamente')

    } catch (err) {
      console.error('❌ Error al iniciar escáner:', err)
      setError(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      setIsScanning(false)
    }
  }

  const detenerEscáner = () => {
    setIsScanning(false)
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
  }

  const procesarCodigoQR = async (codigoQR: string) => {
    try {
      // Detener el escáner temporalmente
      detenerEscáner()
      
      console.log('Procesando código QR:', codigoQR)
      
      // Validar formato del código QR
      if (!codigoQR.startsWith('SAA-')) {
        setError('Código QR inválido. Debe ser un código del sistema SAA.')
        onError('Código QR inválido')
        return
      }

      const response = await fetch('/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_qr: codigoQR,
          id_clase: idClase
        })
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', data)

      if (response.ok && data.status === 'success') {
        setUltimaAsistencia(data.data)
        onAsistenciaRegistrada(data.data)
        setError(null)
        
        // Mostrar mensaje de éxito temporal
        setTimeout(() => {
          setUltimaAsistencia(null)
        }, 5000)
      } else {
        setError(data.error || 'Error al registrar asistencia')
        onError(data.error || 'Error al registrar asistencia')
      }
    } catch (err) {
      console.error('Error al procesar código QR:', err)
      const errorMsg = 'Error de conexión al registrar asistencia'
      setError(errorMsg)
      onError(errorMsg)
    }
  }

  const handleCodigoManual = (e: React.FormEvent) => {
    e.preventDefault()
    if (codigoManual.trim()) {
      procesarCodigoQR(codigoManual.trim())
      setCodigoManual('')
    }
  }

  useEffect(() => {
    return () => {
      detenerEscáner()
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">📱 Escáner QR Mejorado</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-600">
            {isScanning ? 'Escaneando...' : 'Detenido'}
          </span>
        </div>
      </div>
      
      {/* Controles del escáner */}
      <div className="mb-4">
        {!isScanning ? (
          <button
            onClick={iniciarEscáner}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>📷</span>
            Iniciar Escáner QR
          </button>
        ) : (
          <button
            onClick={detenerEscáner}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>⏹️</span>
            Detener Escáner
          </button>
        )}
      </div>

      {/* Video del escáner */}
      {isScanning && (
        <div className="mb-4">
          <div className="relative w-full max-w-md mx-auto">
            <video
              ref={videoRef}
              className="w-full rounded-lg border-2 border-blue-300"
              playsInline
              muted
            />
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600 mb-2">
              Apunta la cámara al código QR del aprendiz
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Escaneando...</span>
            </div>
          </div>
        </div>
      )}

      {/* Entrada manual para testing */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">🔧 Entrada Manual (Para Pruebas)</h4>
        <form onSubmit={handleCodigoManual} className="flex gap-2">
          <input
            type="text"
            value={codigoManual}
            onChange={(e) => setCodigoManual(e.target.value)}
            placeholder="Pegar código QR aquí (ej: SAA-23-DANNY-HEREDIA-...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            ✅ Registrar
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-1">
          Usa esta opción si la cámara no funciona o para pruebas rápidas
        </p>
        
        {/* Botón de prueba con código QR de ejemplo */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              const codigoEjemplo = "SAA-24-JOHANA-HEREDIA-1757379010862-a9422c966f9bac74"
              setCodigoManual(codigoEjemplo)
            }}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
          >
            🧪 Usar código de ejemplo
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Última asistencia registrada */}
      {ultimaAsistencia && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ Última Asistencia Registrada</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-700">Estudiante:</span>
              <span className="font-medium text-green-800">
                {ultimaAsistencia.asistencia.nombre} {ultimaAsistencia.asistencia.apellido}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Estado:</span>
              <SemáforoAsistencia 
                estado={ultimaAsistencia.estado_determinado as EstadoAsistencia}
                tamaño="sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Hora de registro:</span>
              <span className="text-green-800">{ultimaAsistencia.hora_registro}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Hora de inicio de clase:</span>
              <span className="text-green-800">{ultimaAsistencia.hora_inicio_clase}</span>
            </div>
          </div>
        </div>
      )}

      {/* Información del sistema */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Sistema de Semáforo Automático</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>🟢 <strong>Verde:</strong> Llegó a tiempo o antes de la hora de inicio</p>
          <p>🟡 <strong>Amarillo:</strong> Llegó tarde pero dentro de los 15 minutos de tolerancia</p>
          <p>🔴 <strong>Rojo:</strong> Llegó muy tarde o no se registró asistencia</p>
        </div>
      </div>
    </div>
  )
}
