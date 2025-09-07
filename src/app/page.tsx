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
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  // 🔹 Mock centralizado aquí (agrega tantos como quieras)
  const allData: Row[] = [
    // Ficha 255001
    { fecha:'25/03/2025', hora:'6:20 pm', llegada:'rojo',    nombre:'María Torres',      cedula:'356429', genero:'F', correo:'maria.torres@gmail.com',   celular:'3201112233', ficha:'255001' },
    { fecha:'25/03/2025', hora:'6:00 pm', llegada:'amarillo',nombre:'Juan Peña',         cedula:'245620', genero:'M', correo:'juan.pena@gmail.com',      celular:'3002223344', ficha:'255001' },
    { fecha:'25/03/2025', hora:'6:15 pm', llegada:'verde',   nombre:'Pedro Ramírez',     cedula:'785412', genero:'M', correo:'pedro.ramirez@gmail.com',  celular:'3009876543', ficha:'255001' },
    { fecha:'25/03/2025', hora:'6:10 pm', llegada:'verde',   nombre:'Ana Morales',       cedula:'698745', genero:'F', correo:'ana.morales@gmail.com',    celular:'3012233445', ficha:'255001' },
    { fecha:'25/03/2025', hora:'6:05 pm', llegada:'rojo',    nombre:'Felipe Lozano',     cedula:'785123', genero:'M', correo:'felipe.lozano@gmail.com',  celular:'3023344556', ficha:'255001' },

    // Ficha 255002
    { fecha:'25/03/2025', hora:'6:25 pm', llegada:'verde',   nombre:'Luisa Ruiz',        cedula:'568154', genero:'F', correo:'luisa.ruiz@gmail.com',     celular:'3013334455', ficha:'255002' },
    { fecha:'25/03/2025', hora:'6:12 pm', llegada:'amarillo',nombre:'Carolina Méndez',   cedula:'698741', genero:'F', correo:'caro.mendez@gmail.com',    celular:'3046667788', ficha:'255002' },
    { fecha:'25/03/2025', hora:'6:30 pm', llegada:'rojo',    nombre:'Esteban Suárez',    cedula:'895621', genero:'M', correo:'esteban.suarez@gmail.com', celular:'3057778899', ficha:'255002' },
    { fecha:'25/03/2025', hora:'6:18 pm', llegada:'verde',   nombre:'Diana Herrera',     cedula:'451236', genero:'F', correo:'diana.herrera@gmail.com',  celular:'3068889900', ficha:'255002' },
    { fecha:'25/03/2025', hora:'6:35 pm', llegada:'amarillo',nombre:'Andrés Silva',      cedula:'125478', genero:'M', correo:'andres.silva@gmail.com',   celular:'3079990011', ficha:'255002' },

    // Ficha 255003
    { fecha:'25/03/2025', hora:'6:08 pm', llegada:'rojo',    nombre:'Valentina López',   cedula:'159357', genero:'F', correo:'valentina.lopez@gmail.com', celular:'3080001122', ficha:'255003' },
    { fecha:'25/03/2025', hora:'6:22 pm', llegada:'verde',   nombre:'Luis Jorge',        cedula:'784512', genero:'M', correo:'luis.jorge@gmail.com',     celular:'3035556677', ficha:'255003' },
    { fecha:'25/03/2025', hora:'6:14 pm', llegada:'amarillo',nombre:'Camila Vargas',     cedula:'456123', genero:'F', correo:'camila.vargas@gmail.com',  celular:'3102223344', ficha:'255003' },
    { fecha:'25/03/2025', hora:'6:40 pm', llegada:'verde',   nombre:'Mateo Fernández',   cedula:'963258', genero:'M', correo:'mateo.fernandez@gmail.com', celular:'3113334455', ficha:'255003' },
    { fecha:'25/03/2025', hora:'6:20 pm', llegada:'rojo',    nombre:'Laura Castillo',    cedula:'357951', genero:'F', correo:'laura.castillo@gmail.com', celular:'3124445566', ficha:'255003' },

    // Ficha 255004
    { fecha:'25/03/2025', hora:'6:28 pm', llegada:'verde',   nombre:'Sebastián Ríos',    cedula:'753159', genero:'M', correo:'sebastian.rios@gmail.com', celular:'3091112233', ficha:'255004' },
    { fecha:'25/03/2025', hora:'6:19 pm', llegada:'amarillo',nombre:'Diego Castaño',     cedula:'258963', genero:'M', correo:'diego.castano@gmail.com',  celular:'3135556677', ficha:'255004' },
    { fecha:'25/03/2025', hora:'6:11 pm', llegada:'rojo',    nombre:'Tatiana Gómez',     cedula:'785496', genero:'F', correo:'tatiana.gomez@gmail.com',  celular:'3141112233', ficha:'255004' },
    { fecha:'25/03/2025', hora:'6:45 pm', llegada:'verde',   nombre:'David Mendoza',     cedula:'456987', genero:'M', correo:'david.mendoza@gmail.com',  celular:'3152223344', ficha:'255004' },
    { fecha:'25/03/2025', hora:'6:32 pm', llegada:'amarillo',nombre:'Isabella Martínez', cedula:'741258', genero:'F', correo:'isabella.martinez@gmail.com', celular:'3163334455', ficha:'255004' },

    // Ficha 255005
    { fecha:'25/03/2025', hora:'6:27 pm', llegada:'rojo',    nombre:'Cristian Roldán',   cedula:'951753', genero:'M', correo:'cristian.roldan@gmail.com', celular:'3174445566', ficha:'255005' },
    { fecha:'25/03/2025', hora:'6:33 pm', llegada:'verde',   nombre:'Sofía Jiménez',     cedula:'357159', genero:'F', correo:'sofia.jimenez@gmail.com',  celular:'3185556677', ficha:'255005' },
    { fecha:'25/03/2025', hora:'6:17 pm', llegada:'amarillo',nombre:'Carlos Vargas',     cedula:'852741', genero:'M', correo:'carlos.vargas@gmail.com',  celular:'3196667788', ficha:'255005' },
    { fecha:'25/03/2025', hora:'6:50 pm', llegada:'verde',   nombre:'Natalia Rodríguez', cedula:'456258', genero:'F', correo:'natalia.rodriguez@gmail.com', celular:'3207778899', ficha:'255005' },
    { fecha:'25/03/2025', hora:'6:38 pm', llegada:'rojo',    nombre:'Miguel Ángel Soto', cedula:'789456', genero:'M', correo:'miguel.soto@gmail.com',   celular:'3218889900', ficha:'255005' },
  ]

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

  useEffect(() => {
    // Si no está autenticado y no está cargando, redirigir al login
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar active="escanear" />

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
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cerrar Sesión
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
