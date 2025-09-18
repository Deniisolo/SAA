'use client'

import { useState, useRef, useEffect } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode/esm/core'
import { FiCamera, FiX, FiCheck, FiClock, FiUser } from 'react-icons/fi'

interface EscánerQRAsistenciaProps {
  claseId: number
  onAsistenciaRegistrada: (data: any) => void
  onError: (error: string) => void
}

interface AsistenciaRegistrada {
  id: number
  nombre: string
  apellido: string
  estado: 'presente' | 'tardanza' | 'ausente'
  horaRegistro: string
  timestamp: Date
}

export default function EscánerQRAsistencia({ claseId, onAsistenciaRegistrada, onError }: EscánerQRAsistenciaProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const [asistenciasRegistradas, setAsistenciasRegistradas] = useState<AsistenciaRegistrada[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)

  // Limpiar el escáner cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (scanner) {
        try {
          scanner.clear()
        } catch (error) {
          console.log('Error al limpiar scanner en cleanup:', error)
        }
      }
    }
  }, [scanner])

  const startScanning = async () => {
    if (scanner) {
      scanner.clear()
      setScanner(null)
    }

    // Primero actualizar el estado para mostrar el elemento
    setIsScanning(true)

    // Usar setTimeout para asegurar que el DOM se actualice
    setTimeout(async () => {
      const qrReaderElement = document.getElementById('qr-reader')
      if (!qrReaderElement) {
        console.error('Elemento qr-reader no encontrado')
        setIsScanning(false)
        return
      }

      // Limpiar el contenido previo
      qrReaderElement.innerHTML = ''

      try {
        // Verificar que la cámara esté disponible
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (videoDevices.length === 0) {
          console.error('No se encontraron cámaras disponibles')
          setIsScanning(false)
          return
        }

        console.log('Cámaras disponibles:', videoDevices.length)

        const newScanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeSupportedFormats.QR_CODE],
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
            useBarCodeDetectorIfSupported: false,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: false
            }
          },
          false
        )

        try {
          newScanner.render(
            (decodedText: string, result: Html5QrcodeResult) => {
              console.log('Código QR escaneado:', decodedText)
              handleQRCodeScanned(decodedText)
            },
            (error: Html5QrcodeError) => {
              // Ignorar errores de escaneo continuo
              if (error.type !== 'NO_QR_CODE_FOUND') {
                console.log('Error de escaneo:', error)
              }
            }
          )

          setScanner(newScanner)
          console.log('Escáner QR iniciado correctamente')
        } catch (renderError) {
          console.error('Error al renderizar el escáner:', renderError)
          setIsScanning(false)
        }
      } catch (error) {
        console.error('Error al iniciar el escáner:', error)
        setIsScanning(false)
      }
    }, 100) // Pequeño delay para asegurar que el DOM se actualice
  }

  const stopScanning = () => {
    if (scanner) {
      try {
        scanner.clear()
      } catch (error) {
        console.log('Error al limpiar scanner:', error)
      }
      setScanner(null)
    }
    
    // Limpiar el elemento DOM
    const qrReaderElement = document.getElementById('qr-reader')
    if (qrReaderElement) {
      qrReaderElement.innerHTML = ''
    }
    
    setIsScanning(false)
  }

  const handleQRCodeScanned = async (qrCode: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    
    try {
      // Detener el escáner temporalmente
      if (scanner) {
        try {
          scanner.clear()
        } catch (error) {
          console.log('Error al limpiar scanner:', error)
        }
        setScanner(null)
      }
      setIsScanning(false)

      // Registrar la asistencia
      const response = await fetch('/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_qr: qrCode,
          id_clase: claseId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Agregar a la lista de asistencias registradas
        const nuevaAsistencia: AsistenciaRegistrada = {
          id: Date.now(),
          nombre: data.data.usuario.nombre,
          apellido: data.data.usuario.apellido,
          estado: data.data.estado_determinado,
          horaRegistro: data.data.hora_registro,
          timestamp: new Date()
        }

        setAsistenciasRegistradas(prev => [nuevaAsistencia, ...prev])
        
        // Notificar al componente padre
        onAsistenciaRegistrada(data)
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          // Reanudar el escáner después de un breve delay
          setTimeout(() => {
            if (!isScanning) {
              startScanning()
            }
          }, 2000)
        }, 1000)

      } else {
        onError(data.message || 'Error al registrar la asistencia')
        // Reanudar el escáner en caso de error
        setTimeout(() => {
          if (!isScanning) {
            startScanning()
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Error al procesar QR:', error)
      onError('Error de conexión al registrar asistencia')
      // Reanudar el escáner en caso de error
      setTimeout(() => {
        if (!isScanning) {
          startScanning()
        }
      }, 2000)
    } finally {
      setIsProcessing(false)
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'presente':
        return <FiCheck className="text-green-500" />
      case 'tardanza':
        return <FiClock className="text-yellow-500" />
      case 'ausente':
        return <FiX className="text-red-500" />
      default:
        return <FiUser className="text-gray-500" />
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'tardanza':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ausente':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiCamera className="text-blue-500" />
            Escáner QR de Asistencia
          </h2>
          <p className="text-gray-600 mt-1">Escanea los códigos QR de los aprendices para registrar asistencia</p>
        </div>
        
        <div className="flex gap-2">
          {!isScanning ? (
            <>
              <button
                onClick={startScanning}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiCamera />
                Iniciar Escáner
              </button>
              <button
                onClick={async () => {
                  try {
                    const devices = await navigator.mediaDevices.enumerateDevices()
                    const videoDevices = devices.filter(device => device.kind === 'videoinput')
                    console.log('🔍 Cámaras disponibles:', videoDevices.length)
                    videoDevices.forEach((device, index) => {
                      console.log(`Cámara ${index + 1}:`, device.label || 'Cámara sin nombre')
                    })
                    
                    // Probar acceso a la cámara
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                    console.log('✅ Cámara accesible:', stream.getVideoTracks().length, 'pistas de video')
                    stream.getTracks().forEach(track => track.stop())
                  } catch (error) {
                    console.error('❌ Error al acceder a la cámara:', error)
                  }
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
              >
                🔍 Probar Cámara
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('🚀 Iniciando escáner alternativo...')
                    setIsScanning(true)
                    
                    const qrReaderElement = document.getElementById('qr-reader')
                    if (!qrReaderElement) {
                      console.error('Elemento qr-reader no encontrado')
                      return
                    }

                    // Limpiar el contenido previo
                    qrReaderElement.innerHTML = ''

                    // Crear un video simple para mostrar la cámara
                    const video = document.createElement('video')
                    video.style.width = '100%'
                    video.style.height = '300px'
                    video.style.border = '2px solid #ccc'
                    video.style.borderRadius = '8px'
                    video.autoplay = true
                    video.muted = true
                    video.playsInline = true

                    qrReaderElement.appendChild(video)

                    // Obtener stream de la cámara
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                      video: { 
                        facingMode: 'environment',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                      } 
                    })
                    
                    video.srcObject = stream
                    
                    console.log('✅ Escáner alternativo iniciado - Cámara funcionando')
                    console.log('💡 Nota: Esta es una versión simplificada. Usa la entrada manual para probar códigos QR.')
                    
                  } catch (error) {
                    console.error('❌ Error al iniciar escáner alternativo:', error)
                    setIsScanning(false)
                  }
                }}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
              >
                🎥 Escáner Simple
              </button>
            </>
          ) : (
            <button
              onClick={stopScanning}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FiX />
              Detener Escáner
            </button>
          )}
        </div>
      </div>

      {/* Área del Escáner */}
      <div className="mb-6">
        <div className="relative">
          {/* Elemento del escáner - siempre presente pero oculto cuando no se está escaneando */}
          <div 
            id="qr-reader" 
            className={`w-full max-w-md mx-auto ${!isScanning ? 'hidden' : ''}`}
          ></div>
          
          {/* Overlay de procesamiento */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white p-4 rounded-lg flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Procesando...</span>
              </div>
            </div>
          )}
          
          {/* Placeholder cuando no se está escaneando */}
          {!isScanning && (
            <div className="w-full max-w-md mx-auto h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <FiCamera className="mx-auto h-12 w-12 mb-2" />
                <p>Haz clic en "Iniciar Escáner" para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Asistencias Registradas */}
      {asistenciasRegistradas.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Asistencias Registradas en esta Sesión
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {asistenciasRegistradas.map((asistencia) => (
              <div
                key={asistencia.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {getEstadoIcon(asistencia.estado)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {asistencia.nombre} {asistencia.apellido}
                    </p>
                    <p className="text-sm text-gray-500">
                      Registrado a las {asistencia.horaRegistro}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(asistencia.estado)}`}>
                  {asistencia.estado.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entrada Manual de Código QR */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">🔧 Entrada Manual (si la cámara no funciona):</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Pega aquí el código QR de Lolita o Danny"
            className="flex-1 p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement
                if (input.value.trim()) {
                  handleQRCodeScanned(input.value.trim())
                  input.value = ''
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder*="Pega aquí"]') as HTMLInputElement
              if (input?.value.trim()) {
                handleQRCodeScanned(input.value.trim())
                input.value = ''
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Procesar
          </button>
        </div>
        <div className="mt-2 text-xs text-green-700">
          <strong>Códigos de prueba:</strong><br/>
          Lolita: <code className="bg-green-100 px-1 rounded">SAA-17-LOLITA-TORRES-1758152822558-a776e9b2616f05d3</code><br/>
          Danny: <code className="bg-green-100 px-1 rounded">SAA-18-DANNY-HEREDIA-1758152866478-56c42ec35483deb2</code>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Asegúrate de que la cámara tenga permisos</li>
          <li>• Mantén el código QR centrado en el marco</li>
          <li>• El sistema determinará automáticamente si es presente, tardanza o ausente</li>
          <li>• Los códigos QR de Danny y Lolita ya están configurados</li>
          <li>• Si la cámara no funciona, usa la entrada manual arriba</li>
        </ul>
      </div>
    </div>
  )
}