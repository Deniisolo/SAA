// src/app/page.tsx
'use client'

import Navbar from './components/Navbar'
import DataTable, { Row } from './components/DataTable'
import ChatWidget from './components/ChatWidget'
import LoadingSpinner from '../components/LoadingSpinner'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  // Estado para los datos de aprendices
  const [allData, setAllData] = useState<Row[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // Todos los hooks deben estar al inicio, antes de cualquier return condicional
  const fechaHoy = useMemo(() => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }, [])

  const fichas = useMemo(
    () => Array.from(new Set(allData.map(r => r.ficha))).sort(),
    [allData]
  )

  const [selectedFicha, setSelectedFicha] = useState<string>('') // '' = todas
  const filtered = useMemo(
    () => (selectedFicha ? allData.filter(r => r.ficha === selectedFicha) : allData),
    [allData, selectedFicha]
  )

  // Función para cargar aprendices de la base de datos
  const loadAprendices = async () => {
    try {
      setDataLoading(true)
      setDataError(null)
      
      const response = await fetch('/api/aprendices')
      const data = await response.json()
      
      if (response.ok) {
        // Convertir datos de la API al formato esperado por DataTable
        const aprendicesData: Row[] = data.data.aprendices.map((aprendiz: any) => ({
          fecha: fechaHoy, // Usar fecha actual
          hora: new Date().toLocaleTimeString('es-CO', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          llegada: 'verde', // Por defecto verde (puntual)
          nombre: `${aprendiz.nombre} ${aprendiz.apellido}`,
          cedula: aprendiz.numero_documento,
          genero: aprendiz.genero === 'Masculino' ? 'M' : 'F',
          correo: aprendiz.correo,
          celular: aprendiz.telefono,
          ficha: aprendiz.ficha
        }))
        
        setAllData(aprendicesData)
      } else {
        setDataError(data.error || 'Error al cargar los aprendices')
      }
    } catch (error) {
      setDataError('Error de conexión al cargar los aprendices')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    // Si no está autenticado y no está cargando, redirigir al login
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    // Cargar aprendices cuando el usuario esté autenticado
    if (isAuthenticated && !loading) {
      loadAprendices()
    }
  }, [isAuthenticated, loading, fechaHoy])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }

  // Mostrar loading mientras se cargan los datos
  if (dataLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar active="home" />
        <LoadingSpinner message="Cargando aprendices..." />
      </main>
    )
  }

  // Mostrar error si hay problemas cargando los datos
  if (dataError) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar active="home" />
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error al cargar datos</h2>
              <p className="text-red-600 mb-4">{dataError}</p>
              <button
                onClick={loadAprendices}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar active="home" />

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        {/* Header secundario */}
        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm sm:text-base text-gray-800">
              <span className="font-medium">Nombre del instructor:</span>{' '}
              <span className="font-semibold text-blue-600">
                {user?.nombre} {user?.apellido}
              </span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {user?.rol}
              </span>
            </p>

            {/* 🔽 Select de ficha */}
            <label className="flex items-center gap-2 text-sm sm:text-base text-gray-800">
              <span className="font-medium">Número de la Ficha:</span>
              <select
                value={selectedFicha}
                onChange={(e) => setSelectedFicha(e.target.value)}
                className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Todas</option>
                {fichas.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm sm:text-base text-gray-900">
              <span className="font-semibold">Fecha: </span>{fechaHoy}
            </p>
            <button
              onClick={loadAprendices}
              disabled={dataLoading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {dataLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden">
          <DataTable data={filtered} />
        </div>
      </section>

      <ChatWidget label="Hola, soy Asistín!" className="fixed right-6 bottom-6" />
    </main>
  )
}
