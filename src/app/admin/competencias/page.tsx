'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import Navbar from '../../components/Navbar'
import { GenericDataTable, Column } from '../../components/DataTable'

interface Competencia {
  id_competencia: number
  nombre_competencia: string
  descripcion: string | null
  codigo_competencia: string
  clases_count: number
  competencias_ficha_count: number
}

export default function GestionCompetencias() {
  const { user, hasRole } = useAuth()
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompetencias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/competencias-simple')
      if (response.ok) {
        const data = await response.json()
        setCompetencias(data.data || [])
      } else {
        setError('Error al cargar las competencias')
      }
    } catch (err) {
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
    // Implementar modal o navegación para crear competencia
    console.log('Crear competencia')
  }

  const handleEdit = (competencia: Competencia) => {
    // Implementar modal o navegación para editar competencia
    console.log('Editar competencia:', competencia)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta competencia?')) {
      try {
        const response = await fetch(`/api/competencias/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchCompetencias() // Recargar la lista
        } else {
          setError('Error al eliminar la competencia')
        }
      } catch (err) {
        setError('Error de conexión')
      }
    }
  }

  const columns: Column[] = [
    { key: 'codigo_competencia', label: 'Código' },
    { key: 'nombre_competencia', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'clases_count', label: 'Clases', render: (competencia: Competencia) => competencia.clases_count },
    { key: 'fichas_count', label: 'Fichas', render: (competencia: Competencia) => competencia.competencias_ficha_count }
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
            data={competencias}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
