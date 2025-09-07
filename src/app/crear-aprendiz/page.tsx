'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
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

const FICHAS = ['255001', '255002', '255003', '255004', '255005'] as const

export default function CrearAprendizPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [form, setForm] = useState<Form>({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    genero: 'M',
    correo: '',
    celular: '',
    ficha: FICHAS[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return null
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      // TODO: conectar a tu API o Firebase
      console.log('Crear aprendiz:', form)
      setOk(true)
      setTimeout(() => setOk(false), 2500)

      // reset
      setForm({
        nombre: '',
        apellido: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        genero: 'M',
        correo: '',
        celular: '',
        ficha: FICHAS[0],
      })
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
                <Select
                  icon={<FiHash />}
                  value={form.ficha}
                  onChange={v => set('ficha', v)}
                  options={FICHAS.map(f => ({ value: f, label: f }))}
                />
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-green-600 text-white px-5 py-2 shadow-lg">
          Aprendiz creado correctamente
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
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  icon?: React.ReactNode
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
        className={`h-12 w-full appearance-none rounded-xl bg-gray-100 px-4 ${
          icon ? 'pl-10' : ''
        } text-sm text-gray-900 outline-none
                    border border-transparent focus:border-blue-400 focus:bg-white transition
                    bg-[length:10px_10px] bg-no-repeat`}
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



