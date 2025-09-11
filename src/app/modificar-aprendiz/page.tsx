'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../providers/AuthProvider'
import { FiEdit2, FiTrash2, FiX, FiSearch } from 'react-icons/fi'
import ChatWidget from '../components/ChatWidget' 

type Llegada = 'verde' | 'amarillo' | 'rojo'
type Row = {
  id: string
  fecha: string
  hora: string
  llegada: Llegada
  nombre: string
  cedula: string
  genero: 'M' | 'F'
  correo: string
  celular: string
  ficha: string
}


function Dot({ color }: { color: Llegada }) {
  const map = { verde:'bg-green-500', amarillo:'bg-yellow-400', rojo:'bg-red-500' } as const
  return <span className={`inline-block h-3.5 w-3.5 rounded-full ${map[color]}`} />
}

export default function ModificarAprendizPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // estado base - TODOS LOS HOOKS AL INICIO
  const [rows, setRows] = useState<Row[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [ficha, setFicha] = useState('')
  const [editing, setEditing] = useState<Row | null>(null)

  // Todos los useMemo y funciones deben estar aquí, antes de cualquier return condicional
  const fichas = useMemo(
    () => Array.from(new Set(rows.map(r => r.ficha))).sort(),
    [rows]
  )

  const filtered = useMemo(() => {
    let list = rows
    if (ficha) list = list.filter(r => r.ficha === ficha)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(r =>
        r.nombre.toLowerCase().includes(q) || r.cedula.includes(q)
      )
    }
    return list
  }, [rows, ficha, query])

  const allChecked = filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(r => next.delete(r.id))
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(r => next.add(r.id))
        return next
      })
    }
  }

  const onDelete = () => {
    if (selectedIds.size === 0) return
    if (!confirm(`¿Eliminar ${selectedIds.size} registro(s)?`)) return
    setRows(rows.filter(r => !selectedIds.has(r.id)))
    setSelectedIds(new Set())
  }

  const openEdit = () => {
    if (selectedIds.size !== 1) return
    const id = Array.from(selectedIds)[0]
    setEditing(rows.find(r => r.id === id) ?? null)
  }

  const saveEdit = async (updated: Row) => {
    try {
      // Extraer datos del formulario
      const [nombre, apellido] = updated.nombre.split(' ')
      const tipoDocumento = 'CC' // Por defecto, se puede mejorar
      const genero = updated.genero
      
      const response = await fetch(`/api/aprendices/${updated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre || '',
          apellido: apellido || '',
          tipoDocumento: tipoDocumento,
          numeroDocumento: updated.cedula,
          genero: genero,
          correo: updated.correo,
          celular: updated.celular,
          ficha: updated.ficha,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Actualizar la lista local con los datos actualizados
        setRows(prev => prev.map(r => (r.id === updated.id ? updated : r)))
        setEditing(null)
        
        // Recargar los datos desde la base de datos para asegurar sincronización
        await loadAprendices()
        
        // Mostrar mensaje de éxito (opcional)
        alert('Aprendiz actualizado exitosamente')
      } else {
        // Mostrar error específico
        alert(data.error || 'Error al actualizar el aprendiz')
      }
    } catch {
      alert('Error de conexión al actualizar el aprendiz')
    }
  }

  // fecha de hoy para header derecho
  const fechaHoy = useMemo(() => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }, [])

  // Función para cargar aprendices de la base de datos
  const loadAprendices = async () => {
    try {
      setDataLoading(true)
      setDataError(null)
      
      const response = await fetch('/api/aprendices')
      const data = await response.json()
      
      if (response.ok) {
        // Convertir datos de la API al formato esperado
        const aprendicesData: Row[] = data.data.aprendices.map((aprendiz: {
          id: number
          nombre: string
          apellido: string
          documento: string
          correo_electronico: string
          telefono: string
          genero: string
          correo: string
          ficha?: {
            numero_ficha: string
          }
        }) => ({
          id: aprendiz.id.toString(),
          fecha: new Date().toLocaleDateString('es-CO'),
          hora: new Date().toLocaleTimeString('es-CO', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          llegada: 'verde' as Llegada, // Por defecto verde (puntual)
          nombre: `${aprendiz.nombre} ${aprendiz.apellido}`,
          cedula: aprendiz.documento,
          genero: aprendiz.genero === 'Masculino' ? 'M' as const : 'F' as const,
          correo: aprendiz.correo,
          celular: aprendiz.telefono,
          ficha: aprendiz.ficha
        }))
        
        setRows(aprendicesData)
      } else {
        setDataError(data.error || 'Error al cargar los aprendices')
      }
    } catch {
      setDataError('Error de conexión al cargar los aprendices')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    // Cargar aprendices cuando el usuario esté autenticado
    if (isAuthenticated && !authLoading) {
      loadAprendices()
    }
  }, [isAuthenticated, authLoading])

  if (authLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return null
  }

  // Mostrar loading mientras se cargan los datos
  if (dataLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar active="modificar" />
        <LoadingSpinner message="Cargando aprendices..." />
      </main>
    )
  }

  // Mostrar error si hay problemas cargando los datos
  if (dataError) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar active="modificar" />
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
      <Navbar active="modificar" />

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        {/* Controles superiores */}
        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm sm:text-base text-gray-800">
              <span className="font-medium">Buscar:</span>
              <div className="relative">
                <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="por cédula o nombre..."
                  className="h-9 w-64 rounded-md border border-gray-300 bg-white pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </label>

            <label className="flex items-center gap-2 text-sm sm:text-base text-gray-800">
              <span className="font-medium">Ficha:</span>
              <select
                value={ficha}
                onChange={(e) => setFicha(e.target.value)}
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
          <div className="overflow-x-auto bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <Th className="w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      aria-label="Seleccionar todos"
                    />
                  </Th>
                  <Th>Fecha</Th>
                  <Th>Hora</Th>
                  <Th className="text-center">Llegada</Th>
                  <Th>Nombres y Apellidos</Th>
                  <Th>Cédula</Th>
                  <Th>Género</Th>
                  <Th>Correo</Th>
                  <Th>Celular</Th>
                  <Th>Ficha</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const checked = selectedIds.has(r.id)
                  return (
                    <tr key={r.id} className={`even:bg-gray-50 ${checked ? 'bg-gray-100' : ''}`}>
                      <Td className="text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(r.id)}
                          aria-label={`Seleccionar ${r.nombre}`}
                        />
                      </Td>
                      <Td>{r.fecha}</Td>
                      <Td>{r.hora}</Td>
                      <Td className="text-center"><Dot color={r.llegada} /></Td>
                      <Td>{r.nombre}</Td>
                      <Td>{r.cedula}</Td>
                      <Td>{r.genero}</Td>
                      <Td className="truncate max-w-[220px]">{r.correo}</Td>
                      <Td>{r.celular}</Td>
                      <Td>{r.ficha}</Td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={10}>
                      No hay resultados para tu búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones inferiores */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            onClick={onDelete}
            disabled={selectedIds.size === 0}
            className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-5 py-2 text-gray-900 shadow-md disabled:opacity-50"
            title="Eliminar registro(s)"
          >
            <FiTrash2 />
            Eliminar Registro
          </button>

          <button
            onClick={openEdit}
            disabled={selectedIds.size !== 1}
            className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-5 py-2 text-gray-900 shadow-md disabled:opacity-50"
            title="Modificar registro"
          >
            <FiEdit2 />
            Modificar Registro
          </button>
        </div>
      </section>

        <ChatWidget
        label="Hola, soy Asistín!"
        className="fixed bottom-6 right-6 z-40"
      />

      {/* Modal de edición */}
      {editing && (
        <EditModal
          value={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </main>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-800 ${className}`}>{children}</td>
}

/* ---------- Modal de edición ---------- */
function EditModal({
  value,
  onClose,
  onSave,
}: {
  value: Row
  onClose: () => void
  onSave: (v: Row) => void
}) {
  const [form, setForm] = useState<Row>(value)
  const [nombre, setNombre] = useState(value.nombre.split(' ')[0] || '')
  const [apellido, setApellido] = useState(value.nombre.split(' ').slice(1).join(' ') || '')
  const [tipoDocumento, setTipoDocumento] = useState('CC')

  const set = <K extends keyof Row>(key: K, v: Row[K]) =>
    setForm(prev => ({ ...prev, [key]: v }))

  const handleSave = () => {
    const updatedForm = {
      ...form,
      nombre: `${nombre} ${apellido}`.trim()
    }
    onSave(updatedForm)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">Modificar aprendiz</h3>
          <button onClick={onClose} className="p-1 text-gray-600 hover:text-gray-800">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
          <Field label="Nombre">
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="input" />
          </Field>
          <Field label="Apellido">
            <input value={apellido} onChange={e => setApellido(e.target.value)}
              className="input" />
          </Field>
          <Field label="Tipo de Documento">
            <select value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} className="input">
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </Field>
          <Field label="Número de Documento">
            <input value={form.cedula} onChange={e => set('cedula', e.target.value)}
              className="input" />
          </Field>
          <Field label="Género">
            <select value={form.genero} onChange={e => set('genero', e.target.value as 'M' | 'F')} className="input">
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </Field>
          <Field label="Celular">
            <input value={form.celular} onChange={e => set('celular', e.target.value)}
              className="input" />
          </Field>
          <Field label="Correo" full>
            <input value={form.correo} onChange={e => set('correo', e.target.value)}
              className="input" />
          </Field>
          <Field label="Ficha">
            <input value={form.ficha} onChange={e => set('ficha', e.target.value)}
              className="input" />
          </Field>
          <Field label="Llegada">
            <div className="flex items-center gap-3">
              {(['verde','amarillo','rojo'] as Llegada[]).map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={form.llegada === opt}
                    onChange={() => set('llegada', opt)}
                  />
                  <span className="flex items-center gap-1">
                    <Dot color={opt} /> {opt}
                  </span>
                </label>
              ))}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Guardar cambios
          </button>
        </div>
      </div>

      {/* estilos inputs */}
      <style jsx>{`
        .input {
          @apply h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400;
        }
      `}</style>
    </div>
  )
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}
