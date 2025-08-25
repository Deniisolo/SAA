'use client'

import Image from 'next/image'
import { useState } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)

  return (
    <main className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Lado izquierdo: ilustración */}
      <div className="relative hidden lg:flex items-center justify-center bg-white">
        <Image
          src="/login-illustration.png"
          alt="Ilustración de laboratorio"
          width={600}
          height={600}
          className="object-contain w-4/5 h-auto"
          priority
        />
      </div>

      {/* Lado derecho: formulario */}
      <div className="flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight mb-8">
            Bienvenido a <span className="text-blue-500 font-extrabold">SAA</span>
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              // TODO: lógica de autenticación
            }}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-500" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Ejemplo@gmail.com"
                  className="h-12 w-full rounded-xl bg-gray-100 pl-10 pr-4 text-gray-900 placeholder-gray-400 outline-none ring-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" />
                </span>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  placeholder="•••••••••••••••"
                  className="h-12 w-full rounded-xl bg-gray-100 pl-10 pr-10 text-gray-900 placeholder-gray-400 outline-none ring-0 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Olvidaste tu contraseña */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="mt-2 h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

