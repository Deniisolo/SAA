'use client'

import React, { useState, useRef, useEffect } from 'react'
import QrScanner from 'qr-scanner'

export default function TestQRScannerMejorado() {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedCode, setDetectedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  const iniciarEscáner = async () => {
    try {
      setError(null)
      setIsScanning(true)
      setDetectedCode(null

      // Esperar un poco para asegurar que el video esté renderizado
      await new Promise(resolve => setTimeout(resolve, 200))

      if (!videoRef.current) {
        throw new Error('Elemento de video no disponible. Intenta recargar la página.')
      }

      console.log('Creando instancia de QrScanner...')

      // Crear instancia de QrScanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('🎯 QR detectado:', result.data)
          setDetectedCode(result.data)
          detenerEscáner()
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

  useEffect(() => {
    return () => {
      detenerEscáner()
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🧪 Test de Escáner QR Mejorado</h3>
      
      <div className="mb-4">
        {!isScanning ? (
          <button
            onClick={iniciarEscáner}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Iniciar Test
          </button>
        ) : (
          <button
            onClick={detenerEscáner}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Detener Test
          </button>
        )}
      </div>

      {isScanning && (
        <div className="mb-4">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-300"
            playsInline
            muted
          />
          <p className="text-center text-sm text-gray-600 mt-2">
            Apunta la cámara a cualquier código QR
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {detectedCode && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ Código QR Detectado</h4>
          <p className="text-green-700 font-mono text-sm break-all">{detectedCode}</p>
          <button
            onClick={() => setDetectedCode(null)}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            Limpiar
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Información</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Usa la librería <strong>qr-scanner</strong> (más confiable)</p>
          <p>• Detecta cualquier código QR</p>
          <p>• Funciona mejor en dispositivos móviles</p>
          <p>• Requiere acceso a la cámara</p>
        </div>
      </div>
    </div>
  )
}
