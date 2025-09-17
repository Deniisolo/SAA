'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import Navbar from '../../components/Navbar'
import { GenericDataTable, Column } from '../../components/DataTable'
import { FiX } from 'react-icons/fi'

interface Competencia {
  id_competencia: number
  nombre_competencia: string
  descripcion: string | null
  codigo_competencia: string
  clases_count: number
  competencias_ficha_count: number
}

interface FormData {
  nombre_competencia: string
  descripcion: string
  codigo_competencia: string
}

export default function GestionCompetencias() {
  const { hasRole } = useAuth()
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCompetencia, setEditingCompetencia] = useState<Competencia | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombre_competencia: '',
    descripcion: '',
    codigo_competencia: ''
  })
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const fetchCompetencias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/competencias')
      if (response.ok) {
        const data = await response.json()
        setCompetencias(data.data || [])
      } else {
        setError('Error al cargar las competencias')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchCompetencias()
    }
  }, [hasRole])

  // Verificar permisos
  if (!hasRole(['admin'])) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="competencias" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleCreate = () => {
    setEditingCompetencia(null)
    setFormData({
      nombre_competencia: '',
      descripcion: '',
      codigo_competencia: ''
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleEdit = (competencia: Record<string, unknown>) => {
    const comp = competencia as unknown as Competencia
    setEditingCompetencia(comp)
    setFormData({
      nombre_competencia: comp.nombre_competencia,
      descripcion: comp.descripcion || '',
      codigo_competencia: comp.codigo_competencia
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCompetencia(null)
    setFormData({
      nombre_competencia: '',
      descripcion: '',
      codigo_competencia: ''
    })
    setFormErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    const errors: Record<string, string> = {}
    if (!formData.nombre_competencia.trim()) {
      errors.nombre_competencia = 'El nombre de la competencia es obligatorio'
    }
    if (!formData.codigo_competencia.trim()) {
      errors.codigo_competencia = 'El código de la competencia es obligatorio'
    }
    
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    setLoadingSubmit(true)
    
    try {
      const url = editingCompetencia 
        ? `/api/competencias/${editingCompetencia.id_competencia}`
        : '/api/competencias'
      
      const method = editingCompetencia ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        handleCloseModal()
        fetchCompetencias() // Recargar la lista
        setError(null)
      } else {
        setFormErrors({ general: data.error || 'Error al procesar la competencia' })
      }
    } catch (error) {
      setFormErrors({ general: 'Error de conexión' })
    } finally {
      setLoadingSubmit(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta competencia?')) {
      // Actualización optimista: eliminar inmediatamente de la interfaz
      const originalCompetencias = [...competencias]
      setCompetencias(prevCompetencias => prevCompetencias.filter(comp => comp.id_competencia !== id))
      
      try {
        const response = await fetch(`/api/competencias/${id}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
          // La eliminación fue exitosa, mantener el estado actualizado
          setError(null)
        } else {
          // Si falló, restaurar el estado original
          setCompetencias(originalCompetencias)
          setError(data.error || 'Error al eliminar la competencia')
        }
      } catch {
        // Si hay error de conexión, restaurar el estado original
        setCompetencias(originalCompetencias)
        setError('Error de conexión')
      }
    }
  }

  const columns: Column[] = [
    { key: 'codigo_competencia', label: 'Código' },
    { key: 'nombre_competencia', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'clases_count', label: 'Clases', render: (competencia) => (competencia as unknown as Competencia).clases_count },
    { key: 'fichas_count', label: 'Fichas', render: (competencia) => (competencia as unknown as Competencia).competencias_ficha_count }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="competencias" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="competencias" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Competencias</h1>
          <p className="text-gray-600">Administra las competencias del sistema</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Competencias</h2>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Competencia
              </button>
            </div>
          </div>
          
          <GenericDataTable
            data={competencias as unknown as Record<string, unknown>[]}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modal para crear/editar competencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCompetencia ? 'Editar Competencia' : 'Crear Nueva Competencia'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{formErrors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Competencia *
                </label>
                <input
                  type="text"
                  value={formData.codigo_competencia}
                  onChange={(e) => setFormData({ ...formData, codigo_competencia: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.codigo_competencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 240201501"
                />
                {formErrors.codigo_competencia && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.codigo_competencia}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Competencia *
                </label>
                <input
                  type="text"
                  value={formData.nombre_competencia}
                  onChange={(e) => setFormData({ ...formData, nombre_competencia: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.nombre_competencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Promover la interacción idónea consigo mismo"
                />
                {formErrors.nombre_competencia && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.nombre_competencia}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción de la competencia (opcional)"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSubmit 
                    ? (editingCompetencia ? 'Actualizando...' : 'Creando...') 
                    : (editingCompetencia ? 'Actualizar Competencia' : 'Crear Competencia')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
