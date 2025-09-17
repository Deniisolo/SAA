'use client'

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react'
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
  rol: { nombre_rol: string; id_Rol: number }
  tipo_documento: { nombre_documento: string; id_Tipo_Documento: number }
  estado_estudiante: { descripcion_estado: string; id_estado_estudiante: number }
  ficha: { numero_ficha: string; id_ficha: number }
  genero: { descripcion: string; id_genero: number }
  programa_formacion: { nombre_programa: string; idPrograma_formacion: number }
}

interface Rol {
  id_Rol: number
  nombre_rol: string
}

interface TipoDocumento {
  id_Tipo_Documento: number
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
  idPrograma_formacion: number
  nombre_programa: string
}

// Formulario completamente independiente con estado interno
const UsuarioForm = memo(function UsuarioForm({
  initialData,
  showEditModal,
  roles,
  tiposDocumento,
  estadosEstudiante,
  fichas,
  generos,
  programasFormacion,
  currentUserRole,
  onSubmit,
  onCancel
}: {
  initialData: any
  showEditModal: boolean
  roles: Rol[]
  tiposDocumento: TipoDocumento[]
  estadosEstudiante: EstadoEstudiante[]
  fichas: Ficha[]
  generos: Genero[]
  programasFormacion: ProgramaFormacion[]
  currentUserRole: string
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(initialData)

  // Memoizar la determinación de campos de estudiante
  const showStudentFields = useMemo(() => {
    return formData.Rol_id_Rol && 
      roles.find(rol => rol.id_Rol.toString() === formData.Rol_id_Rol)?.nombre_rol.toLowerCase() === 'aprendiz'
  }, [formData.Rol_id_Rol, roles])

  // Memoizar las opciones filtradas para evitar recálculos
  const filteredTiposDocumento = useMemo(() => 
    tiposDocumento
      .filter(tipo => tipo.id_Tipo_Documento)
      .filter((tipo, index, self) => 
        index === self.findIndex(t => t.nombre_documento === tipo.nombre_documento)
      ), [tiposDocumento])

  const filteredRoles = useMemo(() => 
    roles
      .filter(rol => rol.id_Rol)
      .filter((rol, index, self) => 
        index === self.findIndex(r => r.nombre_rol === rol.nombre_rol)
      ), [roles])

  const filteredEstadosEstudiante = useMemo(() => 
    estadosEstudiante
      .filter(estado => estado.id_estado_estudiante)
      .filter((estado, index, self) => 
        index === self.findIndex(e => e.descripcion_estado === estado.descripcion_estado)
      ), [estadosEstudiante])

  const filteredFichas = useMemo(() => 
    fichas.filter(ficha => ficha.id_ficha), [fichas])

  const filteredGeneros = useMemo(() => 
    generos
      .filter(genero => genero.id_genero)
      .filter((genero, index, self) => 
        index === self.findIndex(g => g.descripcion === genero.descripcion)
      ), [generos])

  const filteredProgramasFormacion = useMemo(() => 
    programasFormacion
      .filter(programa => programa.idPrograma_formacion)
      .filter((programa, index, self) => 
        index === self.findIndex(p => p.nombre_programa === programa.nombre_programa)
      ), [programasFormacion])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, nombre: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, apellido: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, correo_electronico: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, telefono: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            value={formData.TipoDocumento_id_Tipo_Documento}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, TipoDocumento_id_Tipo_Documento: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo</option>
            {filteredTiposDocumento.map((tipo, index) => (
              <option key={`tipo-${tipo.id_Tipo_Documento || index}`} value={tipo.id_Tipo_Documento}>
                {tipo.nombre_documento}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento
          </label>
          <input
            type="text"
            value={formData.numero_documento}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, numero_documento: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, usemame: e.target.value }))}
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
              onChange={(e) => setFormData((prev: any) => ({ ...prev, Contrasenia: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, Rol_id_Rol: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar rol</option>
            {filteredRoles.map((rol, index) => (
              <option key={`rol-${rol.id_Rol || index}`} value={rol.id_Rol}>
                {rol.nombre_rol}
              </option>
            ))}
          </select>
        </div>
        {showStudentFields && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Estudiante
            </label>
            <select
              value={formData.EstadoEstudiante_id_estado_estudiante}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, EstadoEstudiante_id_estado_estudiante: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar estado</option>
              {filteredEstadosEstudiante.map((estado, index) => (
                <option key={`estado-${estado.id_estado_estudiante || index}`} value={estado.id_estado_estudiante}>
                  {estado.descripcion_estado}
                </option>
              ))}
            </select>
          </div>
        )}
        {showStudentFields && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ficha
            </label>
            <select
              value={formData.Ficha_id_ficha}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, Ficha_id_ficha: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar ficha</option>
              {filteredFichas.map((ficha, index) => (
                <option key={`ficha-${ficha.id_ficha || index}`} value={ficha.id_ficha}>
                  {ficha.numero_ficha}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género
          </label>
          <select
            value={formData.Genero_id_genero}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, Genero_id_genero: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar género</option>
            {filteredGeneros.map((genero, index) => (
              <option key={`genero-${genero.id_genero || index}`} value={genero.id_genero}>
                {genero.descripcion}
              </option>
            ))}
          </select>
        </div>
        {showStudentFields && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Programa de Formación
            </label>
            <select
              value={formData.Programa_formacion_idPrograma_formacion}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, Programa_formacion_idPrograma_formacion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar programa</option>
              {filteredProgramasFormacion.map((programa, index) => (
                <option key={`programa-${programa.idPrograma_formacion || index}`} value={programa.idPrograma_formacion}>
                  {programa.nombre_programa}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
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
})

export default function GestionUsuarios() {
  const { hasRole, user } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [referenceDataLoading, setReferenceDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  
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

  const fetchUsuarios = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      const startTime = performance.now()
      
      const response = await fetch(`/api/usuarios?page=${page}&limit=${itemsPerPage}`)
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.data || [])
        setTotalItems(data.total || 0)
        setCurrentPage(page)
        
        const endTime = performance.now()
        const loadTime = Math.round(endTime - startTime)
        console.log(`Usuarios cargados en ${loadTime}ms`)
      } else {
        setError('Error al cargar los usuarios')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage])

  const fetchReferenceData = useCallback(async () => {
    try {
      setReferenceDataLoading(true)
      const startTime = performance.now()
      
      // Cargar todos los datos de referencia en una sola llamada
      const response = await fetch('/api/reference-data')
      if (response.ok) {
        const data = await response.json()
        const referenceData = data.data
        
        // Actualizar estados
        setRoles(referenceData.roles || [])
        setTiposDocumento(referenceData.tiposDocumento || [])
        setEstadosEstudiante(referenceData.estadosEstudiante || [])
        setFichas(referenceData.fichas || [])
        setGeneros(referenceData.generos || [])
        setProgramasFormacion(referenceData.programasFormacion || [])
        
        const endTime = performance.now()
        const loadTime = Math.round(endTime - startTime)
        console.log(`Datos de referencia cargados en ${loadTime}ms (cached: ${data.cached})`)
      } else {
        console.error('Error al cargar datos de referencia')
      }
    } catch (error) {
      console.error('Error al cargar datos de referencia:', error)
    } finally {
      setReferenceDataLoading(false)
    }
  }, [])

  // Funciones de paginación
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsuarios(page)
    }
  }

  useEffect(() => {
    // Ejecutar solo al montar. Evita re-ejecuciones por cambios de referencia en hasRole
    if (hasRole(['admin'])) {
      // Cargar solo usuarios inicialmente, los datos de referencia se cargan cuando se abren los modales
      fetchUsuarios(1)
    }
  }, [fetchUsuarios, hasRole])

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

  const handleCreate = async () => {
    resetForm()
    setShowCreateModal(true)
    // Cargar datos de referencia solo cuando se abre el modal
    if (roles.length === 0) {
      await fetchReferenceData()
    }
  }

  const handleEdit = async (usuario: Record<string, unknown>) => {
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
      Rol_id_Rol: user.rol.id_Rol.toString(),
      TipoDocumento_id_Tipo_Documento: user.tipo_documento.id_Tipo_Documento.toString(),
      EstadoEstudiante_id_estado_estudiante: user.estado_estudiante.id_estado_estudiante.toString(),
      Ficha_id_ficha: user.ficha.id_ficha.toString(),
      Genero_id_genero: user.genero.id_genero.toString(),
      Programa_formacion_idPrograma_formacion: user.programa_formacion.idPrograma_formacion.toString()
    })
    setShowEditModal(true)
    // Cargar datos de referencia solo cuando se abre el modal
    if (roles.length === 0) {
      await fetchReferenceData()
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/usuarios/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchUsuarios(currentPage) // Recargar la lista manteniendo la página actual
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

  const handleSubmit = async (data: any) => {
    try {
      const url = showEditModal ? `/api/usuarios/${editingUsuario?.id_usuario}` : '/api/usuarios'
      const method = showEditModal ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingUsuario(null)
        resetForm()
        fetchUsuarios(currentPage)
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="usuarios" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
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
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} usuarios
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {/* Mostrar números de página */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum > totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
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
          {referenceDataLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando datos del formulario...</p>
            </div>
          ) : (
            <UsuarioForm
              initialData={formData}
              showEditModal={false}
              roles={roles}
              tiposDocumento={tiposDocumento}
              estadosEstudiante={estadosEstudiante}
              fichas={fichas}
              generos={generos}
              programasFormacion={programasFormacion}
              currentUserRole={user?.rol || ''}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowCreateModal(false)
                resetForm()
              }}
            />
          )}
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
          {referenceDataLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando datos del formulario...</p>
            </div>
          ) : (
            <UsuarioForm
              initialData={formData}
              showEditModal={true}
              roles={roles}
              tiposDocumento={tiposDocumento}
              estadosEstudiante={estadosEstudiante}
              fichas={fichas}
              generos={generos}
              programasFormacion={programasFormacion}
              currentUserRole={user?.rol || ''}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowEditModal(false)
                setEditingUsuario(null)
                resetForm()
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
