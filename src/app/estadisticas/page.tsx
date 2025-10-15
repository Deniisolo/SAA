'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import ChatWidget from '../components/ChatWidget'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../providers/AuthProvider'
import StatsChart from '../components/StatsChart'
import { FiChevronDown } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as htmlToImage from 'html-to-image'

interface AsistenciaReal {
  id_asistencia: number
  fecha_asistencia: string
  hora_registro: string | null
  estado_asistencia: string
  id_usuario: number
  nombre: string
  apellido: string
  numero_documento: string
  id_clase: number
  nombre_clase: string
  fecha_clase: string
  hora_inicio: string
  hora_fin: string
  id_competencia: number
  nombre_competencia: string
  codigo_competencia: string
}

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

function EstadisticasPageContent() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [vista, setVista] = useState<'aprendiz' | 'aprendices'>('aprendices')
  const [openList, setOpenList] = useState(false)
  const [seleccionado, setSeleccionado] = useState(APRENDICES[0])
  const [loading, setLoading] = useState(true)
  const [asistenciasReales, setAsistenciasReales] = useState<AsistenciaReal[]>([])
  const [loadingAsistencias, setLoadingAsistencias] = useState(true)

  // refs & handlers de descarga
  const chartCardRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Función para obtener asistencias reales
  const fetchAsistenciasReales = async () => {
    try {
      setLoadingAsistencias(true)
      const response = await fetch('/api/asistencias-filtradas')
      if (response.ok) {
        const data = await response.json()
        setAsistenciasReales(data.data || [])
      } else {
        console.error('Error al obtener asistencias:', response.status)
      }
    } catch (error) {
      console.error('Error de conexión:', error)
    } finally {
      setLoadingAsistencias(false)
    }
  }

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

  // Cargar asistencias reales
  useEffect(() => {
    fetchAsistenciasReales()
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

  // Obtener lista de aprendices únicos de las asistencias reales
  const aprendicesReales = useMemo(() => {
    const aprendicesMap = new Map()
    asistenciasReales.forEach(asistencia => {
      const key = `${asistencia.nombre} ${asistencia.apellido}`
      if (!aprendicesMap.has(key)) {
        aprendicesMap.set(key, {
          nombre: key,
          documento: asistencia.numero_documento
        })
      }
    })
    return Array.from(aprendicesMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [asistenciasReales])

  // Procesar datos reales por fechas (vista general)
  const serieGeneral: Serie[] = useMemo(() => {
    if (asistenciasReales.length === 0) return []
    
    const fechasMap = new Map()
    
    asistenciasReales.forEach(asistencia => {
      const fecha = new Date(asistencia.fecha_clase).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      if (!fechasMap.has(fecha)) {
        fechasMap.set(fecha, {
          fecha,
          tardanzas: 0,
          inasistencias: 0
        })
      }
      
      const datosFecha = fechasMap.get(fecha)
      if (asistencia.estado_asistencia === 'tardanza') {
        datosFecha.tardanzas++
      } else if (asistencia.estado_asistencia === 'ausente') {
        datosFecha.ausentes++
      }
    })

    return Array.from(fechasMap.values()).sort((a, b) => 
      new Date(a.fecha.split('/').reverse().join('-')).getTime() - 
      new Date(b.fecha.split('/').reverse().join('-')).getTime()
    )
  }, [asistenciasReales])

  // Procesar datos reales por aprendiz específico
  const seriePorAprendiz: Serie[] = useMemo(() => {
    if (asistenciasReales.length === 0 || !seleccionado) return []
    
    // Filtrar asistencias del aprendiz seleccionado
    const asistenciasAprendiz = asistenciasReales.filter(asistencia => 
      `${asistencia.nombre} ${asistencia.apellido}` === seleccionado
    )

    const fechasMap = new Map()
    
    asistenciasAprendiz.forEach(asistencia => {
      const fecha = new Date(asistencia.fecha_clase).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      if (!fechasMap.has(fecha)) {
        fechasMap.set(fecha, {
          fecha,
          tardanzas: 0,
          inasistencias: 0
        })
      }
      
      const datosFecha = fechasMap.get(fecha)
      if (asistencia.estado_asistencia === 'tardanza') {
        datosFecha.tardanzas++
      } else if (asistencia.estado_asistencia === 'ausente') {
        datosFecha.ausentes++
      }
    })

    return Array.from(fechasMap.values()).sort((a, b) => 
      new Date(a.fecha.split('/').reverse().join('-')).getTime() - 
      new Date(b.fecha.split('/').reverse().join('-')).getTime()
    )
  }, [asistenciasReales, seleccionado])

  const data = vista === 'aprendiz' ? seriePorAprendiz : serieGeneral

  if (authLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return null
  }

  const downloadXLSX = () => {
    const fechaActual = new Date().toLocaleDateString('es-CO')
    const horaActual = new Date().toLocaleTimeString('es-CO')
    
    // Crear hoja de metadatos
    const metadata = [
      ['REPORTE DE ESTADÍSTICAS DE ASISTENCIA'],
      [''],
      ['INFORMACIÓN GENERAL'],
      ['Fecha de generación:', fechaActual],
      ['Hora de generación:', horaActual],
      ['Tipo de vista:', vista === 'aprendiz' ? `Estadísticas de: ${seleccionado}` : 'Estadísticas Generales'],
      ['Total de aprendices:', aprendicesReales.length],
      ['Total de asistencias registradas:', asistenciasReales.length],
      [''],
      ['RESUMEN EJECUTIVO'],
      ['Total de llegadas tarde:', data.reduce((sum, d) => sum + d.tardanzas, 0)],
      ['Total de ausencias:', data.reduce((sum, d) => sum + d.inasistencias, 0)],
      ['Total de incidencias:', data.reduce((sum, d) => sum + d.tardanzas + d.inasistencias, 0)],
      [''],
      ['DATOS DETALLADOS']
    ]
    
    // Crear hoja de datos
    const headers = ['Fecha', 'Llegadas Tarde', 'No Asistencia', 'Total Incidencias', 'Porcentaje Tardanzas', 'Porcentaje Ausencias']
    const rows = data.map(d => {
      const totalIncidencias = d.tardanzas + d.inasistencias
      const porcentajeTardanzas = totalIncidencias > 0 ? ((d.tardanzas / totalIncidencias) * 100).toFixed(1) : '0.0'
      const porcentajeAusencias = totalIncidencias > 0 ? ((d.inasistencias / totalIncidencias) * 100).toFixed(1) : '0.0'
      
      return [
        d.fecha,
        d.tardanzas,
        d.inasistencias,
        totalIncidencias,
        `${porcentajeTardanzas}%`,
        `${porcentajeAusencias}%`
      ]
    })
    
    // Agregar totales
    const totalTardanzas = data.reduce((sum, d) => sum + d.tardanzas, 0)
    const totalAusencias = data.reduce((sum, d) => sum + d.inasistencias, 0)
    const totalIncidencias = totalTardanzas + totalAusencias
    const totalPorcentajeTardanzas = totalIncidencias > 0 ? ((totalTardanzas / totalIncidencias) * 100).toFixed(1) : '0.0'
    const totalPorcentajeAusencias = totalIncidencias > 0 ? ((totalAusencias / totalIncidencias) * 100).toFixed(1) : '0.0'
    
    rows.push(['TOTALES', totalTardanzas, totalAusencias, totalIncidencias, `${totalPorcentajeTardanzas}%`, `${totalPorcentajeAusencias}%`])
    
    // Crear workbook
    const wb = XLSX.utils.book_new()
    
    // Hoja de metadatos
    const wsMetadata = XLSX.utils.aoa_to_sheet(metadata)
    XLSX.utils.book_append_sheet(wb, wsMetadata, 'Información')
    
    // Hoja de datos
    const wsData = XLSX.utils.aoa_to_sheet([headers, ...rows])
    wsData['!cols'] = [
      { wch: 15 }, // Fecha
      { wch: 18 }, // Llegadas Tarde
      { wch: 18 }, // No Asistencia
      { wch: 18 }, // Total Incidencias
      { wch: 20 }, // Porcentaje Tardanzas
      { wch: 20 }  // Porcentaje Ausencias
    ]
    
    // Aplicar formato a la fila de totales
    const totalRowIndex = rows.length
    if (wsData[`A${totalRowIndex + 2}`]) {
      wsData[`A${totalRowIndex + 2}`].s = { font: { bold: true } }
      wsData[`B${totalRowIndex + 2}`].s = { font: { bold: true } }
      wsData[`C${totalRowIndex + 2}`].s = { font: { bold: true } }
      wsData[`D${totalRowIndex + 2}`].s = { font: { bold: true } }
      wsData[`E${totalRowIndex + 2}`].s = { font: { bold: true } }
      wsData[`F${totalRowIndex + 2}`].s = { font: { bold: true } }
    }
    
    XLSX.utils.book_append_sheet(wb, wsData, 'Estadísticas')
    
    // Hoja de aprendices
    const aprendicesHeaders = ['Nombre Completo', 'Número de Documento', 'Total Asistencias', 'Presentes', 'Tardanzas', 'Ausencias', 'Porcentaje Asistencia']
    const aprendicesData = aprendicesReales.map(aprendiz => {
      const asistenciasAprendiz = asistenciasReales.filter(a => 
        `${a.nombre} ${a.apellido}` === aprendiz.nombre
      )
      const totalAsistencias = asistenciasAprendiz.length
      const presentes = asistenciasAprendiz.filter(a => a.estado_asistencia === 'presente').length
      const tardanzas = asistenciasAprendiz.filter(a => a.estado_asistencia === 'tardanza').length
      const ausencias = asistenciasAprendiz.filter(a => a.estado_asistencia === 'ausente').length
      const porcentajeAsistencia = totalAsistencias > 0 ? (((presentes + tardanzas) / totalAsistencias) * 100).toFixed(1) : '0.0'
      
      return [
        aprendiz.nombre,
        aprendiz.documento,
        totalAsistencias,
        presentes,
        tardanzas,
        ausencias,
        `${porcentajeAsistencia}%`
      ]
    })
    
    const wsAprendices = XLSX.utils.aoa_to_sheet([aprendicesHeaders, ...aprendicesData])
    wsAprendices['!cols'] = [
      { wch: 30 }, // Nombre Completo
      { wch: 18 }, // Número de Documento
      { wch: 16 }, // Total Asistencias
      { wch: 12 }, // Presentes
      { wch: 12 }, // Tardanzas
      { wch: 12 }, // Ausencias
      { wch: 18 }  // Porcentaje Asistencia
    ]
    XLSX.utils.book_append_sheet(wb, wsAprendices, 'Aprendices')
    
    // Generar nombre de archivo con fecha
    const fechaArchivo = new Date().toISOString().split('T')[0]
    const nombreArchivo = `estadisticas_${vista === 'aprendiz' ? 'aprendiz' : 'general'}_${fechaArchivo}.xlsx`
    
    XLSX.writeFile(wb, nombreArchivo)
  }

  const downloadPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 40
    let y = 56

    // Título principal
    const titulo =
      vista === 'aprendiz'
        ? `Estadísticas de: ${seleccionado}`
        : 'Estadísticas de aprendices'
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORTE DE ESTADÍSTICAS DE ASISTENCIA', marginX, y)
    y += 24

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(titulo, marginX, y)
    y += 20

    // Información de generación
    const fechaActual = new Date().toLocaleDateString('es-CO')
    const horaActual = new Date().toLocaleTimeString('es-CO')
    
    doc.setFontSize(10)
    doc.text(`Fecha de generación: ${fechaActual}`, marginX, y)
    y += 12
    doc.text(`Hora de generación: ${horaActual}`, marginX, y)
    y += 20

    // Resumen ejecutivo
    const totalTardanzas = data.reduce((sum, d) => sum + d.tardanzas, 0)
    const totalAusencias = data.reduce((sum, d) => sum + d.inasistencias, 0)
    const totalIncidencias = totalTardanzas + totalAusencias

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN EJECUTIVO', marginX, y)
    y += 16

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Total de llegadas tarde: ${totalTardanzas}`, marginX, y)
    y += 12
    doc.text(`Total de ausencias: ${totalAusencias}`, marginX, y)
    y += 12
    doc.text(`Total de incidencias: ${totalIncidencias}`, marginX, y)
    y += 12
    doc.text(`Total de aprendices: ${aprendicesReales.length}`, marginX, y)
    y += 12
    doc.text(`Total de asistencias registradas: ${asistenciasReales.length}`, marginX, y)
    y += 20

    // Gráfico
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
        doc.addImage(dataUrl, 'PNG', marginX, y, imgW, imgH)
        y += imgH + 24
      } catch {
        y += 10
      }
    }

    // Tabla de datos detallados
    const tableData = data.map(d => {
      const totalIncidencias = d.tardanzas + d.inasistencias
      const porcentajeTardanzas = totalIncidencias > 0 ? ((d.tardanzas / totalIncidencias) * 100).toFixed(1) : '0.0'
      const porcentajeAusencias = totalIncidencias > 0 ? ((d.inasistencias / totalIncidencias) * 100).toFixed(1) : '0.0'
      
      return [
        d.fecha,
        String(d.tardanzas),
        String(d.inasistencias),
        String(totalIncidencias),
        `${porcentajeTardanzas}%`,
        `${porcentajeAusencias}%`
      ]
    })

    // Agregar fila de totales
    tableData.push([
      'TOTALES',
      String(totalTardanzas),
      String(totalAusencias),
      String(totalIncidencias),
      totalIncidencias > 0 ? `${((totalTardanzas / totalIncidencias) * 100).toFixed(1)}%` : '0.0%',
      totalIncidencias > 0 ? `${((totalAusencias / totalIncidencias) * 100).toFixed(1)}%` : '0.0%'
    ])

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Llegadas Tarde', 'No Asistencia', 'Total Incidencias', 'Porcentaje Tardanzas', 'Porcentaje Ausencias']],
      body: tableData,
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        halign: 'center'
      },
      headStyles: { 
        fillColor: [47, 124, 247],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: marginX, right: marginX },
      didDrawPage: (data) => {
        // Aplicar formato especial a la fila de totales
        const lastRow = data.table.body.length - 1
        if (lastRow >= 0) {
          const cells = data.table.body[lastRow]
          cells.forEach(cell => {
            cell.styles.fontStyle = 'bold'
            cell.styles.fillColor = [240, 240, 240]
          })
        }
      }
    })

    // Agregar nueva página para tabla de aprendices
    doc.addPage()
    y = 56

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN POR APRENDIZ', marginX, y)
    y += 20

    // Tabla de aprendices
    const aprendicesTableData = aprendicesReales.map(aprendiz => {
      const asistenciasAprendiz = asistenciasReales.filter(a => 
        `${a.nombre} ${a.apellido}` === aprendiz.nombre
      )
      const totalAsistencias = asistenciasAprendiz.length
      const presentes = asistenciasAprendiz.filter(a => a.estado_asistencia === 'presente').length
      const tardanzas = asistenciasAprendiz.filter(a => a.estado_asistencia === 'tardanza').length
      const ausencias = asistenciasAprendiz.filter(a => a.estado_asistencia === 'ausente').length
      const porcentajeAsistencia = totalAsistencias > 0 ? (((presentes + tardanzas) / totalAsistencias) * 100).toFixed(1) : '0.0'
      
      return [
        aprendiz.nombre,
        String(totalAsistencias),
        String(presentes),
        String(tardanzas),
        String(ausencias),
        `${porcentajeAsistencia}%`
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['Aprendiz', 'Total', 'Presentes', 'Tardanzas', 'Ausencias', '% Asistencia']],
      body: aprendicesTableData,
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        halign: 'center'
      },
      headStyles: { 
        fillColor: [47, 124, 247],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: marginX, right: marginX },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80 }, // Aprendiz
        1: { cellWidth: 20 }, // Total
        2: { cellWidth: 20 }, // Presentes
        3: { cellWidth: 20 }, // Tardanzas
        4: { cellWidth: 20 }, // Ausencias
        5: { cellWidth: 25 }  // % Asistencia
      }
    })

    // Generar nombre de archivo con fecha
    const fechaArchivo = new Date().toISOString().split('T')[0]
    const nombreArchivo = `estadisticas_${vista === 'aprendiz' ? 'aprendiz' : 'general'}_${fechaArchivo}.pdf`

    doc.save(nombreArchivo)
  }


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
                {aprendicesReales.length > 0 ? (
                  aprendicesReales.map((aprendiz, idx) => (
                    <button
                      key={aprendiz.nombre}
                      role="option"
                      aria-selected={aprendiz.nombre === seleccionado}
                      className={`w-full rounded-lg px-4 py-2 text-left hover:bg-gray-50 ${
                        aprendiz.nombre === seleccionado ? 'font-semibold text-gray-900' : 'text-gray-700'
                      }`}
                      onClick={() => {
                        setSeleccionado(aprendiz.nombre)
                        setOpenList(false)
                      }}
                      tabIndex={0}
                    >
                      {idx + 1}. {aprendiz.nombre}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center">
                    {loadingAsistencias ? 'Cargando aprendices...' : 'No hay aprendices registrados'}
                  </div>
                )}
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

export default function EstadisticasPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'instructor']}>
      <EstadisticasPageContent />
    </ProtectedRoute>
  )
}

