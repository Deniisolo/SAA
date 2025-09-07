'use client'

import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { useAuth } from '../../providers/AuthProvider'

type NavKey = 'home' | 'escanear' | 'crear' | 'modificar' | 'estadisticas' | 'admin'

export default function Navbar({ active }: { active?: NavKey }) {
  const { user, logout } = useAuth()
  
  const items: { key: NavKey; label: string; href: string }[] = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'escanear', label: 'Escanear QR', href: '/qr' },
    { key: 'crear', label: 'Crear aprendiz', href: '/crear-aprendiz' },
    { key: 'modificar', label: 'Modificar aprendiz', href: '/modificar-aprendiz' },
    { key: 'estadisticas', label: 'Ver estadísticas', href: '/estadisticas' },
    { key: 'admin', label: 'Admin', href: '/admin' },
  ]

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
