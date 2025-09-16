'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../providers/AuthProvider'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiHash,
  FiCreditCard,
  FiUsers,
} from 'react-icons/fi'

type Form = {
  nombre: string
  apellido: string
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PAS'
  numeroDocumento: string
  genero: 'M' | 'F'
  correo: string
  celular: string
  ficha: string
}

interface Ficha {
  id_ficha: number
  numero_ficha: string
  programa_formacion: {
    nombre_programa: string
  }
}

function CrearAprendizPageContent() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // Debug: Log del estado de autenticación
  console.log('CrearAprendizPage - Estado de autenticación:', {
    isAuthenticated,
    authLoading
  })
  
  // TODOS LOS HOOKS AL INICIO
  const [form, setForm] = useState<Form>({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    genero: 'M',
    correo: '',
    celular: '',
    ficha: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [loadingFichas, setLoadingFichas] = useState(true)

  const validar = useMemo(
    () => ({
      required: (v: string) => (v.trim() ? '' : 'Este campo es obligatorio'),
      email: (v: string) =>
        v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? 'Correo inválido'
          : '',
      phone: (v: string) =>
        v.trim() && !/^\d{7,15}$/.test(v.replace(/\s+/g, ''))
          ? 'Número inválido'
          : '',
    }),
    []
  )

  // Cargar fichas desde la base de datos
  const cargarFichas = async () => {
    try {
      setLoadingFichas(true)
      const response = await fetch('/api/fichas')
      const data = await response.json()
      
      if (response.ok) {
        setFichas(data.data || [])
        // Establecer la primera ficha como valor por defecto si hay fichas disponibles
        if (data.data && data.data.length > 0) {
          setForm(prev => ({ ...prev, ficha: data.data[0].numero_ficha }))
        }
      } else {
        console.error('Error al cargar fichas:', data.error)
      }
    } catch (error) {
      console.error('Error de conexión al cargar fichas:', error)
    } finally {
      setLoadingFichas(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      cargarFichas()
    }
  }, [isAuthenticated])

  // FUNCIONES DESPUÉS DE LOS HOOKS
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  // RETURNS CONDICIONALES AL FINAL
  if (authLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Formulario enviado:', form) // Debug
    
    const errs: Record<string, string> = {}

    errs.nombre = validar.required(form.nombre)
    errs.apellido = validar.required(form.apellido)
    errs.numeroDocumento = validar.required(form.numeroDocumento)
    errs.correo =
      validar.required(form.correo) || validar.email(form.correo)
    errs.celular =
      validar.required(form.celular) || validar.phone(form.celular)

    Object.keys(errs).forEach(k => {
      if (!errs[k]) delete errs[k]
    })
    setErrors(errs)
    
    console.log('Errores de validación:', errs) // Debug
    
    if (Object.keys(errs).length) {
      console.log('Formulario tiene errores, no se envía') // Debug
      return
    }

    setLoading(true)
    console.log('Enviando datos al servidor...') // Debug
    
    try {
      const response = await fetch('/api/aprendices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          tipoDocumento: form.tipoDocumento,
          numeroDocumento: form.numeroDocumento,
          genero: form.genero,
          correo: form.correo,
          celular: form.celular,
          ficha: form.ficha,
        }),
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', { status: response.status, data }) // Debug

      if (response.ok) {
        setOk(true)
        setTimeout(() => setOk(false), 3000)

        // Reset form
        setForm({
          nombre: '',
          apellido: '',
          tipoDocumento: 'CC',
          numeroDocumento: '',
          genero: 'M',
          correo: '',
          celular: '',
          ficha: fichas.length > 0 ? fichas[0].numero_ficha : '',
        })
        setErrors({}) // Limpiar errores
      } else {
        // Mostrar error específico
        console.error('Error del servidor:', data) // Debug
        setErrors({ general: data.error || 'Error al crear el aprendiz' })
      }
    } catch (error) {
      console.error('Error de conexión:', error) // Debug
      setErrors({ general: 'Error de conexión. Intenta nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#D9ECFF]">
      <Navbar active="crear" />

      {/* Banda azul claro */}
      <div className="w-full bg-[#D9ECFF]">
        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          <h1 className="text-center text-4xl sm:text-5xl font-semibold text-gray-900 mb-10">
            Agregar a Aprendiz
          </h1>

          {/* Error general */}
          {errors.general && (
            <div className="mx-auto w-full max-w-5xl mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Card */}
          <form
            onSubmit={onSubmit}
            className="mx-auto w-full max-w-5xl rounded-3xl bg-white p-8 sm:p-10 shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
          >
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Nombre" required error={errors.nombre}>
                <Input
                  icon={<FiUser />}
                  value={form.nombre}
                  onChange={v => set('nombre', v)}
                  placeholder="Ej. María"
                />
              </Field>

              <Field label="Género" required>
                <Select
                  icon={<FiUsers />}
                  value={form.genero}
                  onChange={v => set('genero', v as Form['genero'])}
                  options={[
                    { value: 'M', label: 'M' },
                    { value: 'F', label: 'F' },
                  ]}
                />
              </Field>

              <Field label="Apellido" required error={errors.apellido}>
                <Input
                  icon={<FiUser />}
                  value={form.apellido}
                  onChange={v => set('apellido', v)}
                  placeholder="Ej. Torres"
                />
              </Field>

              <Field label="Correo" required error={errors.correo}>
                <Input
                  type="email"
                  icon={<FiMail />}
                  value={form.correo}
                  onChange={v => set('correo', v)}
                  placeholder="nombre@dominio.com"
                />
              </Field>

              <Field label="Tipo de documento">
                <Select
                  icon={<FiCreditCard />}
                  value={form.tipoDocumento}
                  onChange={v =>
                    set('tipoDocumento', v as Form['tipoDocumento'])
                  }
                  options={[
                    { value: 'CC', label: 'CC – Cédula de Ciudadanía' },
                    { value: 'TI', label: 'TI – Tarjeta de Identidad' },
                    { value: 'CE', label: 'CE – Cédula de Extranjería' },
                    { value: 'PAS', label: 'PAS – Pasaporte' },
                  ]}
                />
              </Field>

              <Field label="Número de ficha">
                {loadingFichas ? (
                  <div className="h-12 w-full rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Cargando fichas...</span>
                  </div>
                ) : (
                  <Select
                    icon={<FiHash />}
                    value={form.ficha}
                    onChange={v => set('ficha', v)}
                    options={fichas.map(f => ({ 
                      value: f.numero_ficha, 
                      label: `${f.numero_ficha} - ${f.programa_formacion.nombre_programa}` 
                    }))}
                  />
                )}
              </Field>

              <Field
                label="Número de documento"
                required
                error={errors.numeroDocumento}
              >
                <Input
                  icon={<FiHash />}
                  value={form.numeroDocumento}
                  onChange={v => set('numeroDocumento', v)}
                  placeholder="Ej. 1234567890"
                />
              </Field>

              <Field label="Celular" required error={errors.celular}>
                <Input
                  icon={<FiPhone />}
                  value={form.celular}
                  onChange={v => set('celular', v)}
                  placeholder="3001234567"
                />
              </Field>
            </div>

            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-full bg-[#2F7CF7] px-8 text-white text-base font-semibold shadow-md hover:brightness-105 disabled:opacity-60"
              >
                {loading ? 'Creando…' : 'Crear Aprendiz'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {ok && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-green-600 text-white px-6 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">¡Aprendiz creado exitosamente!</span>
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------- Components de UI ---------- */

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-base font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon?: React.ReactNode
  type?: string
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-12 w-full rounded-xl bg-gray-100 px-4 ${
          icon ? 'pl-10' : ''
        } text-sm text-gray-900 placeholder-gray-400 outline-none
                    border border-transparent focus:border-blue-400 focus:bg-white transition`}
      />
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
  icon,
  disabled = false,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  icon?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`h-12 w-full appearance-none rounded-xl bg-gray-100 px-4 ${
          icon ? 'pl-10' : ''
        } text-sm text-gray-900 outline-none
                    border border-transparent focus:border-blue-400 focus:bg-white transition
                    bg-[length:10px_10px] bg-no-repeat
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          backgroundImage:
            'linear-gradient(45deg,transparent 50%,#9ca3af 50%),linear-gradient(135deg,#9ca3af 50%,transparent 50%)',
          backgroundPosition: 'calc(100% - 18px) 55%, calc(100% - 13px) 55%',
          backgroundSize: '6px 6px, 6px 6px',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function CrearAprendizPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'instructor']}>
      <CrearAprendizPageContent />
    </ProtectedRoute>
  )
}
