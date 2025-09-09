'use client'

import React, { useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'

export default function TestQRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedCode, setDetectedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const iniciarEscáner = async () => {
    try {
      setError(null)
      setIsScanning(true)
      setDetectedCode(null)

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video iniciado, comenzando detección...')
              setTimeout(() => detectarCodigoQR(), 1000)
            })
          }
        }
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      setError('Error al acceder a la cámara')
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
    if (!isScanning || !videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      setTimeout(() => detectarCodigoQR(), 100)
      return
    }

    // Configurar canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dibujar frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Obtener datos de imagen
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Detectar código QR
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      console.log('🎯 QR detectado:', code.data)
      setDetectedCode(code.data)
      detenerEscáner()
      return
    }

    // Continuar escaneando
    setTimeout(() => detectarCodigoQR(), 100)
  }

  useEffect(() => {
    return () => {
      detenerEscáner()
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🧪 Test de Escáner QR</h3>
      
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
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          <p className="text-center text-sm text-gray-600 mt-2">
            Apunta la cámara a un código QR
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
        </div>
      )}
    </div>
  )
}
