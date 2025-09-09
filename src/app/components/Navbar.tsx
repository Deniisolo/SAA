'use client'

import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { useAuth } from '../../providers/AuthProvider'

type NavKey = 'home' | 'usuarios' | 'fichas' | 'competencias' | 'asociaciones' | 'clases' | 'asistencia' | 'agregar-competencias' | 'crear-aprendiz'

export default function Navbar({ active }: { active?: NavKey }) {
  const { user, logout, hasRole } = useAuth()
  
  // Menú para administradores
  const adminItems: { key: NavKey; label: string; href: string }[] = [
    { key: 'home', label: 'Inicio', href: '/' },
    { key: 'usuarios', label: 'Gestión de Usuarios', href: '/admin/usuarios' },
    { key: 'fichas', label: 'Gestión de Fichas', href: '/admin/fichas' },
    { key: 'competencias', label: 'Gestión de Competencias', href: '/admin/competencias' },
    { key: 'agregar-competencias', label: 'Agregar Competencias Química', href: '/admin/agregar-competencias' },
    { key: 'asociaciones', label: 'Asociaciones', href: '/admin/asociaciones' },
    { key: 'crear-aprendiz', label: 'Crear Aprendiz', href: '/crear-aprendiz' },
  ]

  // Menú para instructores
  const instructorItems: { key: NavKey; label: string; href: string }[] = [
    { key: 'home', label: 'Inicio', href: '/' },
    { key: 'clases', label: 'Gestión de Clases', href: '/instructor/clases' },
    { key: 'asistencia', label: 'Asistencia con QR', href: '/instructor/asistencia' },
    { key: 'crear-aprendiz', label: 'Crear Aprendiz', href: '/crear-aprendiz' },
  ]

  // Determinar qué menú mostrar según el rol
  const getMenuItems = () => {
    if (hasRole(['admin'])) {
      return adminItems
    } else if (hasRole(['instructor'])) {
      return instructorItems
    }
    return [{ key: 'home' as NavKey, label: 'Inicio', href: '/' }]
  }

  const items = getMenuItems()

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        {/* Logo a la izquierda */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Logo SAA" width={40} height={40} />
          <span className="font-semibold text-base leading-none">SAA</span>
        </Link>

        {/* Navegación */}
        <nav className="mx-auto">
          <ul className="flex items-center gap-8 text-sm">
            {items.map((it) => (
              <li key={it.key}>
                <Link
                  href={it.href}
                  className={clsx(
                    'relative pb-1 text-gray-700 hover:text-yellow-600 transition-colors',
                    active === it.key && 'text-yellow-600 font-semibold'
                  )}
                >
                  {it.label}
                  {active === it.key && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-yellow-500" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Usuario y Cerrar Sesión */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.nombre} {user.apellido}
              </p>
              <p className="text-xs text-gray-500">{user.rol}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  )
}
