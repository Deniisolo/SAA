'use client'

import { useState, useRef, useEffect } from 'react'
import QrScanner from 'qr-scanner'
import { FiCamera, FiX, FiCheck, FiClock, FiUser } from 'react-icons/fi'

interface AsistenciaRegistrada {
  id: number
  nombre: string
  apellido: string
  estado: 'presente' | 'tardanza' | 'ausente'
  horaRegistro: string
  horaInicioClase: string
}

interface EscánerQRMejoradoProps {
  claseSeleccionada: {
    id_clase: number
    nombre_clase: string
    hora_inicio: string
  } | null
  onAsistenciaRegistrada: (asistencia: AsistenciaRegistrada) => void
}

export default function EscánerQRMejorado({ claseSeleccionada, onAsistenciaRegistrada }: EscánerQRMejoradoProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [asistenciasRegistradas, setAsistenciasRegistradas] = useState<AsistenciaRegistrada[]>([])
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manualQRCode, setManualQRCode] = useState('')
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error' | 'info', mensaje: string } | null>(null)

  const mostrarNotificacion = (tipo: 'success' | 'error' | 'info', mensaje: string) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 3000) // Auto-ocultar después de 3 segundos
  }

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop()
      qrScanner.destroy()
      setQrScanner(null)
    }
    setIsScanning(false)
  }

  const startScanning = async () => {
    try {
      console.log('🚀 Iniciando escáner QR mejorado...')
      setIsScanning(true)

      // Esperar a que el DOM se actualice
      setTimeout(async () => {
        if (!videoRef.current) {
          console.error('Elemento video no encontrado después del timeout')
          setIsScanning(false)
          return
        }

        try {
          // Crear nueva instancia del escáner
          const scanner = new QrScanner(
            videoRef.current,
            (result) => {
              console.log('Código QR escaneado:', result.data)
              handleQRCodeScanned(result.data)
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 5,
            }
          )

          // Iniciar el escáner
          await scanner.start()
          setQrScanner(scanner)
          console.log('✅ Escáner QR mejorado iniciado correctamente')

        } catch (error) {
          console.error('Error al iniciar el escáner:', error)
          setIsScanning(false)
        }
      }, 100) // Pequeño delay para asegurar que el DOM se actualice

    } catch (error) {
      console.error('Error al iniciar el escáner:', error)
      setIsScanning(false)
    }
  }

  const handleQRCodeScanned = async (qrCode: string) => {
    if (isProcessing || !claseSeleccionada) return

    setIsProcessing(true)
    console.log('🔍 Procesando código QR:', qrCode)
    console.log('📋 Clase seleccionada:', claseSeleccionada)

    try {
      console.log('📤 Enviando solicitud a:', '/api/asistencias')
      console.log('📤 Datos a enviar:', {
        codigo_qr: qrCode,
        id_clase: claseSeleccionada.id_clase,
      })
      
      const response = await fetch('/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_qr: qrCode,
          id_clase: claseSeleccionada.id_clase,
        }),
      })
      
      console.log('📡 Response recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      let data
      let responseText = ''
      try {
        responseText = await response.text()
        console.log('📡 Response Text (raw):', responseText)
        
        if (responseText.trim() === '') {
          console.error('❌ Respuesta vacía del servidor')
          mostrarNotificacion('error', '❌ El servidor devolvió una respuesta vacía')
          return
        }
        
        data = JSON.parse(responseText)
        console.log('📡 Respuesta de la API (parsed):', { status: response.status, data })
      } catch (jsonError) {
        console.error('❌ Error al parsear JSON:', jsonError)
        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
        console.log('📡 Response text que causó el error:', responseText)
        
        // Si no es JSON válido pero hay texto, usar el texto como mensaje de error
        if (responseText.trim() !== '') {
          data = { error: responseText }
        } else {
          mostrarNotificacion('error', '❌ Error al procesar respuesta del servidor')
          return
        }
      }

      if (response.ok) {
        // Validar que los datos estén presentes
        if (!data || !data.data || !data.data.usuario) {
          console.error('❌ Datos incompletos en la respuesta:', {
            data: data,
            hasData: !!data,
            hasDataData: !!(data && data.data),
            hasUsuario: !!(data && data.data && data.data.usuario),
            responseStatus: response.status
          })
          mostrarNotificacion('error', '❌ Datos incompletos en la respuesta del servidor')
          return
        }

        const nuevaAsistencia: AsistenciaRegistrada = {
          id: Date.now(),
          nombre: data.data.usuario.nombre,
          apellido: data.data.usuario.apellido,
          estado: data.data.estado_determinado,
          horaRegistro: data.data.hora_registro,
          horaInicioClase: data.data.hora_inicio_clase,
        }

        setAsistenciasRegistradas(prev => [nuevaAsistencia, ...prev])
        onAsistenciaRegistrada(nuevaAsistencia)

        console.log('✅ Asistencia registrada:', nuevaAsistencia)
        mostrarNotificacion('success', `✅ ${nuevaAsistencia.nombre} ${nuevaAsistencia.apellido} - ${nuevaAsistencia.estado.toUpperCase()}`)
      } else {
        console.error('Error al registrar asistencia:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          responseText: responseText || 'No se pudo leer el texto de respuesta'
        })
        
        // Manejar casos donde data esté vacío o no tenga la estructura esperada
        let errorMessage = 'Error desconocido'
        
        // Verificar si data existe y tiene contenido
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          errorMessage = data.error || data.message || 'Error desconocido'
        } else if (data && typeof data === 'string' && data.trim() !== '') {
          errorMessage = data
        } else {
          // Si data está vacío, usar el código de estado HTTP para determinar el error
          switch (response.status) {
            case 400:
              errorMessage = 'Error en la solicitud - verifica los datos enviados'
              break
            case 404:
              errorMessage = 'Usuario o clase no encontrados'
              break
            case 500:
              errorMessage = 'Error interno del servidor'
              break
            default:
              errorMessage = `Error del servidor (código ${response.status})`
          }
        }
        
        // Mostrar mensaje más amigable para asistencias duplicadas
        if (errorMessage.includes('Ya se registró la asistencia') || 
            errorMessage.includes('asistencia para este usuario en esta clase')) {
          console.log('ℹ️ Asistencia ya registrada - esto es normal')
          mostrarNotificacion('info', 'ℹ️ Esta asistencia ya fue registrada anteriormente')
        } else {
          mostrarNotificacion('error', `❌ ${errorMessage}`)
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      mostrarNotificacion('error', '❌ Error de conexión al registrar asistencia')
    } finally {
      setIsProcessing(false)
    }
  }

  const procesarCodigoManual = () => {
    if (manualQRCode.trim()) {
      handleQRCodeScanned(manualQRCode.trim())
      setManualQRCode('')
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'presente': return 'text-green-600 bg-green-100'
      case 'tardanza': return 'text-yellow-600 bg-yellow-100'
      case 'ausente': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case 'presente': return <FiCheck className="text-green-600" />
      case 'tardanza': return <FiClock className="text-yellow-600" />
      case 'ausente': return <FiX className="text-red-600" />
      default: return <FiUser className="text-gray-600" />
    }
  }

  // Limpiar el escáner cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (qrScanner) {
        qrScanner.stop()
        qrScanner.destroy()
      }
    }
  }, [qrScanner])

  if (!claseSeleccionada) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-center">
          Selecciona una clase para iniciar el escáner QR
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Información de la clase */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900">
          Clase: {claseSeleccionada.nombre_clase}
        </h3>
        <p className="text-blue-700">
          Hora de inicio: {claseSeleccionada.hora_inicio}
        </p>
      </div>

      {/* Controles del escáner */}
      <div className="flex gap-2 flex-wrap">
        {!isScanning ? (
          <>
            <button
              onClick={startScanning}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiCamera />
              Iniciar Escáner QR
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

      {/* Video del escáner */}
      {isScanning && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-300"
            style={{ height: '300px' }}
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            Escaneando códigos QR...
          </div>
        </div>
      )}

      {/* Entrada manual */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Entrada Manual (para pruebas)
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualQRCode}
            onChange={(e) => setManualQRCode(e.target.value)}
            placeholder="Pega aquí el código QR"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && procesarCodigoManual()}
          />
          <button
            onClick={procesarCodigoManual}
            disabled={!manualQRCode.trim() || isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Procesar
          </button>
        </div>
      </div>

      {/* Lista de asistencias registradas */}
      {asistenciasRegistradas.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Asistencias Registradas ({asistenciasRegistradas.length})
          </h4>
          <div className="space-y-2">
            {asistenciasRegistradas.map((asistencia) => (
              <div
                key={asistencia.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getEstadoIcono(asistencia.estado)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {asistencia.nombre} {asistencia.apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      Registrado: {asistencia.horaRegistro}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(asistencia.estado)}`}>
                  {asistencia.estado.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de procesamiento */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-center">
            Procesando código QR...
          </p>
        </div>
      )}

      {/* Notificaciones */}
      {notificacion && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notificacion.tipo === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          notificacion.tipo === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">{notificacion.mensaje}</p>
            <button
              onClick={() => setNotificacion(null)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}