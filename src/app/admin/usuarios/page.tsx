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
  rol: { nombre_rol: string; id_rol: number }
  tipo_documento: { nombre_documento: string; id_tipo_documento: number }
  estado_estudiante: { descripcion_estado: string; id_estado_estudiante: number }
  ficha: { numero_ficha: string; id_ficha: number }
  genero: { descripcion: string; id_genero: number }
  programa_formacion: { nombre_programa: string; id_programa_formacion: number }
}

interface Rol {
  id_rol: number
  nombre_rol: string
}

interface TipoDocumento {
  id_tipo_documento: number
  nombre_documento: string
}

interface EstadoEstudiante {
  id_estado_estudiante: number
  descripcion_estado: string
}

interface Ficha {
  id_ficha: number
  numero_ficha: string
}

interface Genero {
  id_genero: number
  descripcion: string
}

interface ProgramaFormacion {
  id_programa_formacion: number
  nombre_programa: string
}

export default function GestionUsuarios() {
  const { hasRole } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  
  // Estados para datos de formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo_electronico: '',
    telefono: '',
    numero_documento: '',
    usemame: '',
    Contrasenia: '',
    Rol_id_Rol: '',
    TipoDocumento_id_Tipo_Documento: '',
    EstadoEstudiante_id_estado_estudiante: '',
    Ficha_id_ficha: '',
    Genero_id_genero: '',
    Programa_formacion_idPrograma_formacion: ''
  })
  
  // Estados para datos de referencia
  const [roles, setRoles] = useState<Rol[]>([])
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([])
  const [estadosEstudiante, setEstadosEstudiante] = useState<EstadoEstudiante[]>([])
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [generos, setGeneros] = useState<Genero[]>([])
  const [programasFormacion, setProgramasFormacion] = useState<ProgramaFormacion[]>([])

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
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchReferenceData = async () => {
    try {
      // Cargar roles
      const rolesResponse = await fetch('/api/roles')
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData.data || [])
      }

      // Cargar tipos de documento
      const tiposResponse = await fetch('/api/tipos-documento')
      if (tiposResponse.ok) {
        const tiposData = await tiposResponse.json()
        setTiposDocumento(tiposData.data || [])
      }

      // Cargar estados de estudiante
      const estadosResponse = await fetch('/api/estados-estudiante')
      if (estadosResponse.ok) {
        const estadosData = await estadosResponse.json()
        setEstadosEstudiante(estadosData.data || [])
      }

      // Cargar fichas
      const fichasResponse = await fetch('/api/fichas')
      if (fichasResponse.ok) {
        const fichasData = await fichasResponse.json()
        setFichas(fichasData.data || [])
      }

      // Cargar géneros
      const generosResponse = await fetch('/api/generos')
      if (generosResponse.ok) {
        const generosData = await generosResponse.json()
        setGeneros(generosData.data || [])
      }

      // Cargar programas de formación
      const programasResponse = await fetch('/api/programas-formacion')
      if (programasResponse.ok) {
        const programasData = await programasResponse.json()
        setProgramasFormacion(programasData.data || [])
      }
    } catch (error) {
      console.error('Error al cargar datos de referencia:', error)
    }
  }

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchUsuarios()
      fetchReferenceData()
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

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correo_electronico: '',
      telefono: '',
      numero_documento: '',
      usemame: '',
      Contrasenia: '',
      Rol_id_Rol: '',
      TipoDocumento_id_Tipo_Documento: '',
      EstadoEstudiante_id_estado_estudiante: '',
      Ficha_id_ficha: '',
      Genero_id_genero: '',
      Programa_formacion_idPrograma_formacion: ''
    })
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEdit = (usuario: Record<string, unknown>) => {
    const user = usuario as unknown as Usuario
    setEditingUsuario(user)
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      correo_electronico: user.correo_electronico,
      telefono: user.telefono || '',
      numero_documento: user.numero_documento || '',
      usemame: user.usemame,
      Contrasenia: '', // No mostrar contraseña
      Rol_id_Rol: user.rol.id_rol.toString(),
      TipoDocumento_id_Tipo_Documento: user.tipo_documento.id_tipo_documento.toString(),
      EstadoEstudiante_id_estado_estudiante: user.estado_estudiante.id_estado_estudiante.toString(),
      Ficha_id_ficha: user.ficha.id_ficha.toString(),
      Genero_id_genero: user.genero.id_genero.toString(),
      Programa_formacion_idPrograma_formacion: user.programa_formacion.id_programa_formacion.toString()
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/usuarios/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchUsuarios() // Recargar la lista
          setError(null)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al eliminar el usuario')
        }
      } catch {
        setError('Error de conexión')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = showEditModal ? `/api/usuarios/${editingUsuario?.id_usuario}` : '/api/usuarios'
      const method = showEditModal ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingUsuario(null)
        resetForm()
        fetchUsuarios()
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al procesar la solicitud')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const columns: Column[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'correo_electronico', label: 'Email' },
    { key: 'numero_documento', label: 'Documento' },
    { key: 'rol', label: 'Rol', render: (usuario) => (usuario as unknown as Usuario).rol.nombre_rol },
    { key: 'ficha', label: 'Ficha', render: (usuario) => (usuario as unknown as Usuario).ficha.numero_ficha },
    { key: 'estado_estudiante', label: 'Estado', render: (usuario) => (usuario as unknown as Usuario).estado_estudiante.descripcion_estado }
  ]

  // Componente Modal
  const Modal = ({ isOpen, onClose, title, children }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode 
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  // Componente Formulario
  const UsuarioForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido *
          </label>
          <input
            type="text"
            required
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.correo_electronico}
            onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento
          </label>
          <input
            type="text"
            value={formData.numero_documento}
            onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            type="text"
            required
            value={formData.usemame}
            onChange={(e) => setFormData({ ...formData, usemame: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {!showEditModal && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={formData.Contrasenia}
              onChange={(e) => setFormData({ ...formData, Contrasenia: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            required
            value={formData.Rol_id_Rol}
            onChange={(e) => setFormData({ ...formData, Rol_id_Rol: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar rol</option>
            {roles.map((rol) => (
              <option key={rol.id_rol} value={rol.id_rol}>
                {rol.nombre_rol}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            value={formData.TipoDocumento_id_Tipo_Documento}
            onChange={(e) => setFormData({ ...formData, TipoDocumento_id_Tipo_Documento: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo</option>
            {tiposDocumento.map((tipo) => (
              <option key={tipo.id_tipo_documento} value={tipo.id_tipo_documento}>
                {tipo.nombre_documento}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado del Estudiante
          </label>
          <select
            value={formData.EstadoEstudiante_id_estado_estudiante}
            onChange={(e) => setFormData({ ...formData, EstadoEstudiante_id_estado_estudiante: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar estado</option>
            {estadosEstudiante.map((estado) => (
              <option key={estado.id_estado_estudiante} value={estado.id_estado_estudiante}>
                {estado.descripcion_estado}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ficha
          </label>
          <select
            value={formData.Ficha_id_ficha}
            onChange={(e) => setFormData({ ...formData, Ficha_id_ficha: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar ficha</option>
            {fichas.map((ficha) => (
              <option key={ficha.id_ficha} value={ficha.id_ficha}>
                {ficha.numero_ficha}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género
          </label>
          <select
            value={formData.Genero_id_genero}
            onChange={(e) => setFormData({ ...formData, Genero_id_genero: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar género</option>
            {generos.map((genero) => (
              <option key={genero.id_genero} value={genero.id_genero}>
                {genero.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programa de Formación
          </label>
          <select
            value={formData.Programa_formacion_idPrograma_formacion}
            onChange={(e) => setFormData({ ...formData, Programa_formacion_idPrograma_formacion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar programa</option>
            {programasFormacion.map((programa) => (
              <option key={programa.id_programa_formacion} value={programa.id_programa_formacion}>
                {programa.nombre_programa}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setEditingUsuario(null)
            resetForm()
          }}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showEditModal ? 'Actualizar' : 'Crear'} Usuario
        </button>
      </div>
    </form>
  )

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
            data={usuarios as unknown as Record<string, unknown>[]}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Modales */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            resetForm()
          }}
          title="Crear Nuevo Usuario"
        >
          <UsuarioForm />
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingUsuario(null)
            resetForm()
          }}
          title="Editar Usuario"
        >
          <UsuarioForm />
        </Modal>
      </div>
    </div>
  )
}
