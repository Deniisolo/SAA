'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../providers/AuthProvider'

function QrScannerPageContent() {

  return (
    <main className="min-h-screen bg-white">
      <Navbar active="escanear" />
      
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Escanear Código QR
          </h1>
          <p className="text-gray-600">
            Escanea el código QR del aprendiz para registrar su asistencia
          </p>
        </header>

        {/* Contenido vacío - se implementará después */}
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Escáner QR
          </h3>
          <p className="text-gray-500">
            Esta funcionalidad se implementará próximamente
          </p>
        </div>
      </div>
    </main>
  )
}

export default function QrScannerPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'instructor']}>
      <QrScannerPageContent />
    </ProtectedRoute>
  )
}
