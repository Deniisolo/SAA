'use client'

import { useState, useEffect } from 'react'
// import { useAuth } from '../../../providers/AuthProvider' // Comentado temporalmente
import Navbar from '../../components/Navbar'
import { GenericDataTable, Column } from '../../components/DataTable'

interface Clase {
  id_clase: number
  nombre_clase: string
  descripcion: string | null
  fecha_clase: string
  hora_inicio: string
  hora_fin: string
  id_competencia: number
  id_instructor: number
  competencia: {
    nombre_competencia: string
    codigo_competencia: string
  }
  _count: {
    asistencias: number
  }
}

export default function GestionClases() {
  // const { user, hasRole } = useAuth() // Comentado temporalmente para evitar errores
  const [clases, setClases] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [claseEditando, setClaseEditando] = useState<Clase | null>(null)
  const [competencias, setCompetencias] = useState<{
    id_competencia: number
    nombre_competencia: string
  }[]>([])
  const [formData, setFormData] = useState({
    nombre_clase: '',
    descripcion: '',
    fecha_clase: '',
    hora_inicio: '',
    hora_fin: '',
    id_competencia: '',
    id_instructor: '7' // ID del instructor por defecto
  })

  const fetchClases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/clases')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setClases(data.data || [])
      } else {
        setError(data.error || 'Error al cargar las clases')
      }
    } catch (err) {
      console.error('Error fetching clases:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompetencias = async () => {
    try {
      const response = await fetch('/api/competencias')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setCompetencias(data.data || [])
      } else {
        console.error('Error al cargar competencias:', data.error)
      }
    } catch (err) {
      console.error('Error fetching competencias:', err)
    }
  }

  useEffect(() => {
    // Cargar clases y competencias sin verificar permisos para pruebas
    fetchClases()
    fetchCompetencias()
  }, []) // Array de dependencias vacío y constante

  // Comentar verificación de permisos temporalmente para pruebas
  // if (!hasRole(['instructor'])) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <Navbar active="clases" />
  //       <div className="container mx-auto px-4 py-8">
  //         <div className="text-center">
  //           <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
  //           <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  const handleCreate = () => {
    setFormData({
      nombre_clase: '',
      descripcion: '',
      fecha_clase: '',
      hora_inicio: '',
      hora_fin: '',
      id_competencia: '',
      id_instructor: '7'
    })
    setShowCreateModal(true)
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError(null)
      
      const response = await fetch('/api/clases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowCreateModal(false)
        fetchClases() // Recargar la lista
        setFormData({
          nombre_clase: '',
          descripcion: '',
          fecha_clase: '',
          hora_inicio: '',
          hora_fin: '',
          id_competencia: '',
          id_instructor: '7'
        })
      } else {
        setError(data.error || 'Error al crear la clase')
        console.error('Error al crear clase:', data)
      }
    } catch (err) {
      console.error('Error de conexión:', err)
      setError('Error de conexión al crear la clase')
    }
  }

  const handleEdit = (clase: Record<string, unknown>) => {
    const claseData = clase as unknown as Clase
    setClaseEditando(claseData)
    setFormData({
      nombre_clase: claseData.nombre_clase,
      descripcion: claseData.descripcion || '',
      fecha_clase: new Date(claseData.fecha_clase).toISOString().split('T')[0],
      hora_inicio: claseData.hora_inicio,
      hora_fin: claseData.hora_fin,
      id_competencia: claseData.id_competencia.toString(),
      id_instructor: claseData.id_instructor.toString()
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      try {
        setError(null) // Limpiar errores previos
        const response = await fetch(`/api/clases/${id}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
          fetchClases() // Recargar la lista
        } else {
          setError(data.error || 'Error al eliminar la clase')
        }
      } catch (err) {
        console.error('Error de conexión:', err)
        setError('Error de conexión al eliminar la clase')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!claseEditando) return

    try {
      setError(null) // Limpiar errores previos
      
      const response = await fetch(`/api/clases/${claseEditando.id_clase}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowEditModal(false)
        setClaseEditando(null)
        fetchClases() // Recargar la lista
      } else {
        setError(data.error || 'Error al actualizar la clase')
        console.error('Error al actualizar clase:', data)
      }
    } catch (err) {
      console.error('Error de conexión:', err)
      setError('Error de conexión al actualizar la clase')
    }
  }

  const closeModal = () => {
    setShowEditModal(false)
    setClaseEditando(null)
    setFormData({
      nombre_clase: '',
      descripcion: '',
      fecha_clase: '',
      hora_inicio: '',
      hora_fin: '',
      id_competencia: '',
      id_instructor: '7'
    })
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setFormData({
      nombre_clase: '',
      descripcion: '',
      fecha_clase: '',
      hora_inicio: '',
      hora_fin: '',
      id_competencia: '',
      id_instructor: '7'
    })
  }

  const columns: Column[] = [
    { key: 'nombre_clase', label: 'Nombre de la Clase' },
    { key: 'competencia', label: 'Competencia', render: (clase) => (clase as unknown as Clase).competencia.nombre_competencia },
    { key: 'codigo', label: 'Código', render: (clase) => (clase as unknown as Clase).competencia.codigo_competencia },
    { key: 'fecha_clase', label: 'Fecha', render: (clase) => formatDate((clase as unknown as Clase).fecha_clase) },
    { key: 'hora_inicio', label: 'Hora Inicio' },
    { key: 'hora_fin', label: 'Hora Fin' },
    { key: 'asistencias_count', label: 'Asistencias', render: (clase) => (clase as unknown as Clase)._count.asistencias }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="clases" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clases...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="clases" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clases</h1>
          <p className="text-gray-600">Administra las clases de tus competencias</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Clases</h2>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Clase
              </button>
            </div>
          </div>
          
          <GenericDataTable
            data={clases as unknown as Record<string, unknown>[]}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Clase</h3>
            
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  name="nombre_clase"
                  value={formData.nombre_clase}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de la Clase
                </label>
                <input
                  type="date"
                  name="fecha_clase"
                  value={formData.fecha_clase}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Crear Clase */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Crear Nueva Clase</h3>
            
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  name="nombre_clase"
                  value={formData.nombre_clase}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Competencia
                </label>
                <select
                  name="id_competencia"
                  value={formData.id_competencia}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar competencia</option>
                  {competencias.map((competencia) => (
                    <option key={competencia.id_competencia} value={competencia.id_competencia}>
                      {competencia.nombre_competencia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de la Clase
                </label>
                <input
                  type="date"
                  name="fecha_clase"
                  value={formData.fecha_clase}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Crear Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
