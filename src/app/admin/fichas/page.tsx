'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { GenericDataTable, Column } from '../../components/DataTable'
import { FiX, FiPlus } from 'react-icons/fi'

interface Ficha {
  id_ficha: number
  numero_ficha: string
  programa_formacion: {
    nombre_programa: string
    nivel_formacion: string
  }
  _count: {
    usuarios: number
  }
}

interface ProgramaFormacion {
  idPrograma_formacion: number
  nombre_programa: string
  nivel_formacion: string
}

interface FormData {
  numero_ficha: string
  id_programa_formacion: string
}

function GestionFichasContent() {
  const { hasRole } = useAuth()
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [programas, setProgramas] = useState<ProgramaFormacion[]>([])
  const [formData, setFormData] = useState<FormData>({
    numero_ficha: '',
    id_programa_formacion: ''
  })
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const fetchFichas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fichas')
      if (response.ok) {
        const data = await response.json()
        setFichas(data.data || [])
      } else {
        setError('Error al cargar las fichas')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgramas = async () => {
    try {
      const response = await fetch('/api/programas-formacion')
      if (response.ok) {
        const data = await response.json()
        setProgramas(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar programas:', error)
    }
  }

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchFichas()
      fetchProgramas()
    }
  }, [hasRole])

  // Verificar permisos
  if (!hasRole(['admin'])) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="fichas" />
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
    setShowModal(true)
    setFormData({
      numero_ficha: '',
      id_programa_formacion: ''
    })
    setFormErrors({})
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      numero_ficha: '',
      id_programa_formacion: ''
    })
    setFormErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    const errors: Record<string, string> = {}
    if (!formData.numero_ficha.trim()) {
      errors.numero_ficha = 'El número de ficha es obligatorio'
    }
    if (!formData.id_programa_formacion) {
      errors.id_programa_formacion = 'El programa de formación es obligatorio'
    }
    
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    setLoadingCreate(true)
    
    try {
      const response = await fetch('/api/fichas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        handleCloseModal()
        fetchFichas() // Recargar la lista
      } else {
        setFormErrors({ general: data.error || 'Error al crear la ficha' })
      }
    } catch (error) {
      setFormErrors({ general: 'Error de conexión' })
    } finally {
      setLoadingCreate(false)
    }
  }

  const handleEdit = (ficha: Record<string, unknown>) => {
    // Implementar modal o navegación para editar ficha
    console.log('Editar ficha:', ficha)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta ficha?')) {
      // Actualización optimista: eliminar inmediatamente de la interfaz
      const originalFichas = [...fichas]
      setFichas(prevFichas => prevFichas.filter(ficha => ficha.id_ficha !== id))
      
      try {
        const response = await fetch(`/api/fichas/${id}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
          // La eliminación fue exitosa, mantener el estado actualizado
          setError(null)
        } else {
          // Si falló, restaurar el estado original
          setFichas(originalFichas)
          setError(data.error || 'Error al eliminar la ficha')
        }
      } catch {
        // Si hay error de conexión, restaurar el estado original
        setFichas(originalFichas)
        setError('Error de conexión')
      }
    }
  }

  const columns: Column[] = [
    { key: 'numero_ficha', label: 'Número de Ficha' },
    { key: 'programa_formacion', label: 'Programa', render: (ficha) => (ficha as unknown as Ficha).programa_formacion.nombre_programa },
    { key: 'nivel_formacion', label: 'Nivel', render: (ficha) => (ficha as unknown as Ficha).programa_formacion.nivel_formacion },
    { key: 'usuarios_count', label: 'Aprendices', render: (ficha) => (ficha as unknown as Ficha)._count.usuarios }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="fichas" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="fichas" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Fichas</h1>
          <p className="text-gray-600">Administra las fichas de formación</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Fichas</h2>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Ficha
              </button>
            </div>
          </div>
          
          <GenericDataTable
            data={fichas as unknown as Record<string, unknown>[]}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modal para crear ficha */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Ficha</h2>
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
                  Número de Ficha *
                </label>
                <input
                  type="text"
                  value={formData.numero_ficha}
                  onChange={(e) => setFormData({ ...formData, numero_ficha: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.numero_ficha ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 2567890"
                />
                {formErrors.numero_ficha && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.numero_ficha}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programa de Formación *
                </label>
                <select
                  value={formData.id_programa_formacion}
                  onChange={(e) => setFormData({ ...formData, id_programa_formacion: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.id_programa_formacion ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar programa...</option>
                  {programas.map((programa) => (
                    <option key={programa.idPrograma_formacion} value={programa.idPrograma_formacion}>
                      {programa.nombre_programa} ({programa.nivel_formacion})
                    </option>
                  ))}
                </select>
                {formErrors.id_programa_formacion && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.id_programa_formacion}</p>
                )}
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
                  disabled={loadingCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingCreate ? 'Creando...' : 'Crear Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GestionFichas() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <GestionFichasContent />
    </ProtectedRoute>
  )
}
