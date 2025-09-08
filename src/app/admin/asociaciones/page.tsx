'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import Navbar from '../../components/Navbar'
import { GenericDataTable, Column } from '../../components/DataTable'

interface CompetenciaFicha {
  id_competencia_ficha: number
  competencia: {
    id_competencia: number
    nombre_competencia: string
    codigo_competencia: string
  }
  ficha: {
    id_ficha: number
    numero_ficha: string
    programa_formacion: {
      nombre_programa: string
    }
  }
}

export default function GestionAsociaciones() {
  const { user, hasRole } = useAuth()
  const [asociaciones, setAsociaciones] = useState<CompetenciaFicha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAsociaciones = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/competencias-ficha')
      if (response.ok) {
        const data = await response.json()
        setAsociaciones(data.data || [])
      } else {
        setError('Error al cargar las asociaciones')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchAsociaciones()
    }
  }, [hasRole])

  // Verificar permisos
  if (!hasRole(['admin'])) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="asociaciones" />
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
    // Implementar modal o navegación para crear asociación
    console.log('Crear asociación')
  }

  const handleEdit = (asociacion: CompetenciaFicha) => {
    // Implementar modal o navegación para editar asociación
    console.log('Editar asociación:', asociacion)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta asociación?')) {
      try {
        const response = await fetch(`/api/competencias-ficha/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchAsociaciones() // Recargar la lista
        } else {
          setError('Error al eliminar la asociación')
        }
      } catch (err) {
        setError('Error de conexión')
      }
    }
  }

  const columns: Column[] = [
    { key: 'ficha', label: 'Ficha', render: (asociacion: CompetenciaFicha) => asociacion.ficha.numero_ficha },
    { key: 'programa', label: 'Programa', render: (asociacion: CompetenciaFicha) => asociacion.ficha.programa_formacion.nombre_programa },
    { key: 'competencia', label: 'Competencia', render: (asociacion: CompetenciaFicha) => asociacion.competencia.nombre_competencia },
    { key: 'codigo', label: 'Código', render: (asociacion: CompetenciaFicha) => asociacion.competencia.codigo_competencia }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="asociaciones" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="asociaciones" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Asociaciones</h1>
          <p className="text-gray-600">Administra las asociaciones entre competencias y fichas</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Asociaciones</h2>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Asociación
              </button>
            </div>
          </div>
          
          <GenericDataTable
            data={asociaciones}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
