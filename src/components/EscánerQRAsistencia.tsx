'use client'

import React, { useState, useRef, useEffect } from 'react'
import SemáforoAsistencia from './SemáforoAsistencia'
import { EstadoAsistencia } from '../lib/asistencia-utils'

interface EscánerQRAsistenciaProps {
  idClase: number
  onAsistenciaRegistrada: (data: any) => void
  onError: (error: string) => void
}

export default function EscánerQRAsistencia({ 
  idClase, 
  onAsistenciaRegistrada, 
  onError 
}: EscánerQRAsistenciaProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [ultimaAsistencia, setUltimaAsistencia] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const iniciarEscáner = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Usar cámara trasera en móviles
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Iniciar detección de códigos QR
      detectarCodigoQR()
    } catch (err) {
      setError('Error al acceder a la cámara. Asegúrate de permitir el acceso.')
      setIsScanning(false)
    }
  }

  const detenerEscáner = () => {
    setIsScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const detectarCodigoQR = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Configurar canvas con las dimensiones del video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dibujar frame actual en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Obtener datos de imagen para procesamiento
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Aquí normalmente usarías una librería como jsQR para detectar códigos QR
    // Por ahora, simularemos la detección con un input manual
    setTimeout(() => detectarCodigoQR(), 100)
  }

  const procesarCodigoQR = async (codigoQR: string) => {
    try {
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

      if (data.success) {
        setUltimaAsistencia(data.data)
        onAsistenciaRegistrada(data.data)
        setError(null)
      } else {
        setError(data.error || 'Error al registrar asistencia')
        onError(data.error || 'Error al registrar asistencia')
      }
    } catch (err) {
      const errorMsg = 'Error de conexión al registrar asistencia'
      setError(errorMsg)
      onError(errorMsg)
    }
  }

  // Simulación de entrada manual para testing
  const [codigoManual, setCodigoManual] = useState('')

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
      <h3 className="text-lg font-semibold mb-4">Escáner QR para Asistencia</h3>
      
      {/* Controles del escáner */}
      <div className="mb-4">
        {!isScanning ? (
          <button
            onClick={iniciarEscáner}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Escáner QR
          </button>
        ) : (
          <button
            onClick={detenerEscáner}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Detener Escáner
          </button>
        )}
      </div>

      {/* Video del escáner */}
      {isScanning && (
        <div className="mb-4">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>
      )}

      {/* Entrada manual para testing */}
      <div className="mb-4">
        <form onSubmit={handleCodigoManual} className="flex gap-2">
          <input
            type="text"
            value={codigoManual}
            onChange={(e) => setCodigoManual(e.target.value)}
            placeholder="Ingresar código QR manualmente (para testing)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Registrar
          </button>
        </form>
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
          <h4 className="font-semibold text-green-800 mb-2">Última Asistencia Registrada</h4>
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
