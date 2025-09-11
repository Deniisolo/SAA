'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import Navbar from '../../components/Navbar'
import { GenericDataTable, Column } from '../../components/DataTable'

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

export default function GestionFichas() {
  const { hasRole } = useAuth()
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchFichas()
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
    // Implementar modal o navegación para crear ficha
    console.log('Crear ficha')
  }

  const handleEdit = (ficha: Record<string, unknown>) => {
    // Implementar modal o navegación para editar ficha
    console.log('Editar ficha:', ficha)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta ficha?')) {
      try {
        const response = await fetch(`/api/fichas/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchFichas() // Recargar la lista
        } else {
          setError('Error al eliminar la ficha')
        }
      } catch {
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
    </div>
  )
}
