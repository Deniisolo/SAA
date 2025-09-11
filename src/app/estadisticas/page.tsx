'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import ChatWidget from '../components/ChatWidget'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../providers/AuthProvider'
import StatsChart from '../components/StatsChart'
import { FiChevronDown } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as htmlToImage from 'html-to-image'

type Serie = { fecha: string; tardanzas: number; inasistencias: number }

const FECHAS = [
  '12-03-2025',
  '13-03-2025',
  '14-03-2025',
  '15-03-2025',
  '16-03-2025',
  '17-03-2025',
] as const

const APRENDICES = [
  'Maria Paula Perez Jimenez',
  'Juan Carlos Pérez Rodríguez',
  'María Fernanda González López',
  'Luis Alberto Ramírez Castillo',
  'Ana Sofía Herrera Morales',
  'José Manuel Fernández Torres',
  'Laura Beatriz Martínez Sánchez',
  'Carlos Eduardo Jiménez Vargas',
  'Elena Patricia Ríos Domínguez',
  'Daniel Alejandro Navarro Méndez',
  'Sofía Valentina Ortiz Gómez',
]

export default function EstadisticasPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [vista, setVista] = useState<'aprendiz' | 'aprendices'>('aprendices')
  const [openList, setOpenList] = useState(false)
  const [seleccionado, setSeleccionado] = useState(APRENDICES[0])
  const [loading, setLoading] = useState(true)

  // refs & handlers de descarga
  const chartCardRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // persistencia
  useEffect(() => {
    const v = localStorage.getItem('estadisticas.vista') as
      | 'aprendiz'
      | 'aprendices'
      | null
    const n = localStorage.getItem('estadisticas.nombre')
    if (v) setVista(v)
    if (n) setSeleccionado(n)
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    localStorage.setItem('estadisticas.vista', vista)
  }, [vista])
  useEffect(() => {
    localStorage.setItem('estadisticas.nombre', seleccionado)
  }, [seleccionado])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // datos agregados
  const serieGeneral: Serie[] = useMemo(
    () => [
      { fecha: FECHAS[0], tardanzas: 1, inasistencias: 6 },
      { fecha: FECHAS[1], tardanzas: 5, inasistencias: 3 },
      { fecha: FECHAS[2], tardanzas: 11, inasistencias: 2 },
      { fecha: FECHAS[3], tardanzas: 5, inasistencias: 10 },
      { fecha: FECHAS[4], tardanzas: 12, inasistencias: 13 },
      { fecha: FECHAS[5], tardanzas: 13, inasistencias: 10 },
    ],
    []
  )

  // datos por aprendiz
  const seriePorAprendiz: Serie[] = useMemo(() => {
    const seed = Math.abs(
      [...seleccionado].reduce((a, c) => a + c.charCodeAt(0), 0)
    )
    const rnd = (i: number) => ((seed * (i + 7)) % 7) // 0..6
    return FECHAS.map((f, i) => ({
      fecha: f,
      tardanzas: rnd(i),
      inasistencias: Math.max(0, rnd(i + 3) - 1),
    }))
  }, [seleccionado])

  const data = vista === 'aprendiz' ? seriePorAprendiz : serieGeneral

  if (authLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return null
  }

  const downloadXLSX = () => {
    const rows = data.map(d => ({
      fecha: d.fecha,
      llegadas_tarde: d.tardanzas,
      no_asistencia: d.inasistencias,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas')
    ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 16 }]
    XLSX.writeFile(
      wb,
      `estadisticas_${vista === 'aprendiz' ? 'aprendiz' : 'general'}.xlsx`
    )
  }

  const downloadPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 40
    let y = 56

    const titulo =
      vista === 'aprendiz'
        ? `Estadísticas de: ${seleccionado}`
        : 'Estadísticas de aprendices'
    doc.setFontSize(16)
    doc.text(titulo, marginX, y)
    y += 16

    if (chartCardRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(chartCardRef.current, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: '#ffffff',
        })
        const maxW = doc.internal.pageSize.getWidth() - marginX * 2
        const imgW = maxW
        const imgH = (imgW * 9) / 16
        doc.addImage(dataUrl, 'PNG', marginX, y + 8, imgW, imgH)
        y += imgH + 24
      } catch {
        y += 10
      }
    }

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Llegadas tarde', 'No asistencia']],
      body: data.map(d => [d.fecha, String(d.tardanzas), String(d.inasistencias)]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [47, 124, 247] },
      margin: { left: marginX, right: marginX },
    })

    doc.save(`estadisticas_${vista === 'aprendiz' ? 'aprendiz' : 'general'}.pdf`)
  }

  // cerrar dropdown al click fuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (openList && dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpenList(false)
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [openList])

  return (
    <main className="min-h-screen bg-white">
      <Navbar active="estadisticas" />

      <section className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24">
        {/* Título */}
        {vista === 'aprendices' ? (
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center sm:text-left mb-8">
            Estadísticas de aprendices
          </h1>
        ) : (
          <div className="mb-6 relative" ref={dropRef}>
            <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Estadísticas de:{' '}
              <span className="font-semibold text-gray-900">{seleccionado}</span>
              <button
                onClick={() => setOpenList(o => !o)}
                className="ml-2 inline-flex items-center rounded-full border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50"
                aria-expanded={openList}
                aria-haspopup="listbox"
              >
                <FiChevronDown />
              </button>
            </p>

            {openList && (
              <div
                role="listbox"
                className="absolute z-20 mt-3 max-h-80 w-full max-w-xl overflow-auto rounded-xl border bg-white p-2 shadow-xl"
              >
                {APRENDICES.map((n, idx) => (
                  <button
                    key={n}
                    role="option"
                    aria-selected={n === seleccionado}
                    className={`w-full rounded-lg px-4 py-2 text-left hover:bg-gray-50 ${
                      n === seleccionado ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setSeleccionado(n)
                      setOpenList(false)
                    }}
                    tabIndex={0}
                  >
                    {idx + 1}. {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Card + acciones */}
        <div className="relative">
          <div
            ref={chartCardRef}
            className="rounded-3xl bg-white p-4 sm:p-6 shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
          >
            {loading ? (
              <div className="h-[360px] animate-pulse rounded-2xl bg-gray-100" />
            ) : data.length === 0 ? (
              <div className="flex h-[360px] items-center justify-center text-gray-500">
                No hay datos para mostrar.
              </div>
            ) : (
              <StatsChart
                data={data.map(d => ({
                  fecha: d.fecha,
                  llegadasTarde: d.tardanzas,
                  noAsistencia: d.inasistencias,
                }))}
                height={360}
              />
            )}
          </div>

          {/* Botones a la derecha */}
       <div
    className="
        absolute right-0 top-1/2 hidden
        -translate-y-1/2 translate-x-full sm:flex
        flex-col gap-3 z-10
    "
    >
  <button
    onClick={downloadXLSX}
    className="rounded-xl bg-[#2F7CF7] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-105"
    title="Descargar Excel"
  >
    Excel (.xlsx)
  </button>
  <button
    onClick={downloadPDF}
    className="rounded-xl bg-[#2F7CF7] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-105"
    title="Descargar PDF"
  >
    PDF
  </button>
</div>

        </div>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setVista('aprendiz')}
            className={`rounded-full px-6 py-2 font-semibold shadow ${
              vista === 'aprendiz' ? 'bg-[#2F7CF7] text-white' : 'bg-gray-200 text-gray-900'
            }`}
          >
            Aprendiz
          </button>
          <button
            onClick={() => setVista('aprendices')}
            className={`rounded-full px-6 py-2 font-semibold shadow ${
              vista === 'aprendices' ? 'bg-[#2F7CF7] text-white' : 'bg-gray-200 text-gray-900'
            }`}
          >
            Aprendices
          </button>
        </div>
      </section>

      {/* Asistín */}
      <ChatWidget label="Hola, soy Asistín!" className="fixed bottom-6 right-6 z-40" />
    </main>
  )
}

