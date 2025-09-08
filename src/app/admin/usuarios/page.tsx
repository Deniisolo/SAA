'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import Navbar from '../../components/Navbar'
import { GenericDataTable, Column } from '../../components/DataTable'

interface Usuario {
  id_usuario: number
  nombre: string
  apellido: string
  correo_electronico: string
  telefono: string
  numero_documento: string
  usemame: string
  rol: { nombre_rol: string }
  tipo_documento: { nombre_documento: string }
  estado_estudiante: { descripcion_estado: string }
  ficha: { numero_ficha: string }
  genero: { descripcion: string }
  programa_formacion: { nombre_programa: string }
}

export default function GestionUsuarios() {
  const { user, hasRole } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.data || [])
      } else {
        setError('Error al cargar los usuarios')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchUsuarios()
    }
  }, [hasRole])

  // Verificar permisos
  if (!hasRole(['admin'])) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="usuarios" />
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
    // Implementar modal o navegación para crear usuario
    console.log('Crear usuario')
  }

  const handleEdit = (usuario: Usuario) => {
    // Implementar modal o navegación para editar usuario
    console.log('Editar usuario:', usuario)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/usuarios/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchUsuarios() // Recargar la lista
        } else {
          setError('Error al eliminar el usuario')
        }
      } catch (err) {
        setError('Error de conexión')
      }
    }
  }

  const columns: Column[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'correo_electronico', label: 'Email' },
    { key: 'numero_documento', label: 'Documento' },
    { key: 'rol', label: 'Rol', render: (usuario: Usuario) => usuario.rol.nombre_rol },
    { key: 'ficha', label: 'Ficha', render: (usuario: Usuario) => usuario.ficha.numero_ficha },
    { key: 'estado_estudiante', label: 'Estado', render: (usuario: Usuario) => usuario.estado_estudiante.descripcion_estado }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="usuarios" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="usuarios" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Usuarios</h2>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Usuario
              </button>
            </div>
          </div>
          
          <GenericDataTable
            data={usuarios}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
