'use client'

import { useState, useRef } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface EstadisticasAprendicesProps {
  asistencias: Array<{
    nombre_competencia: string
    codigo_competencia: string
    estado_asistencia: string
    fecha_asistencia: string
    nombre: string
    apellido: string
    numero_documento: string
  }>
}

type VistaEstadisticas = 'generales' | 'individual'

export default function EstadisticasAprendices({ asistencias }: EstadisticasAprendicesProps) {
  const [vistaActual, setVistaActual] = useState<VistaEstadisticas>('generales')
  const [aprendizSeleccionado, setAprendizSeleccionado] = useState<string>('')
  const chartRef = useRef<HTMLDivElement>(null)
  const estadisticasRef = useRef<HTMLDivElement>(null)

  // Obtener lista única de aprendices
  const obtenerListaAprendices = () => {
    const aprendicesMap = new Map()
    
    asistencias.forEach(asistencia => {
      const key = `${asistencia.nombre} ${asistencia.apellido}`
      if (!aprendicesMap.has(key)) {
        aprendicesMap.set(key, {
          nombre: key,
          documento: asistencia.numero_documento
        })
      }
    })

    return Array.from(aprendicesMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  // Procesar datos para gráfica general por fechas
  const procesarDatosGenerales = () => {
    const fechasMap = new Map()
    
    asistencias.forEach(asistencia => {
      const fecha = new Date(asistencia.fecha_asistencia).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      if (!fechasMap.has(fecha)) {
        fechasMap.set(fecha, {
          fecha,
          tardanzas: 0,
          ausentes: 0
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
  }

  // Procesar datos para gráfica individual por aprendiz
  const procesarDatosIndividuales = () => {
    if (!aprendizSeleccionado) {
      return []
    }

    // Filtrar asistencias del aprendiz seleccionado
    const asistenciasAprendiz = asistencias.filter(asistencia => 
      `${asistencia.nombre} ${asistencia.apellido}` === aprendizSeleccionado
    )

    // Agrupar por fechas
    const fechasMap = new Map()
    
    asistenciasAprendiz.forEach(asistencia => {
      const fecha = new Date(asistencia.fecha_asistencia).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      if (!fechasMap.has(fecha)) {
        fechasMap.set(fecha, {
          fecha,
          tardanzas: 0,
          ausentes: 0
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
  }

  const datosGenerales = procesarDatosGenerales()
  const datosIndividuales = procesarDatosIndividuales()

  // Configuración de la gráfica
  const getChartData = () => {
    if (vistaActual === 'generales') {
      return {
        labels: datosGenerales.map(d => d.fecha),
        datasets: [
          {
            label: 'LLEGADAS TARDE',
            data: datosGenerales.map(d => d.tardanzas),
            backgroundColor: '#3B82F6', // Azul
            borderColor: '#1D4ED8',
            borderWidth: 1,
          },
          {
            label: 'NO ASISTENCIA',
            data: datosGenerales.map(d => d.ausentes),
            backgroundColor: '#F59E0B', // Amarillo
            borderColor: '#D97706',
            borderWidth: 1,
          },
        ],
      }
    } else {
      return {
        labels: datosIndividuales.map(d => d.fecha),
        datasets: [
          {
            label: 'LLEGADAS TARDE',
            data: datosIndividuales.map(d => d.tardanzas),
            backgroundColor: '#3B82F6', // Azul
            borderColor: '#1D4ED8',
            borderWidth: 1,
          },
          {
            label: 'NO ASISTENCIA',
            data: datosIndividuales.map(d => d.ausentes),
            backgroundColor: '#F59E0B', // Amarillo
            borderColor: '#D97706',
            borderWidth: 1,
          },
        ],
      }
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  // Función para descargar estadísticas
  const descargarEstadisticas = () => {
    const datos = vistaActual === 'generales' ? datosGenerales : datosIndividuales
    const fechaActual = new Date().toLocaleDateString('es-CO')
    const horaActual = new Date().toLocaleTimeString('es-CO')
    
    // Calcular totales
    const totalTardanzas = datos.reduce((sum, d) => sum + d.tardanzas, 0)
    const totalAusentes = datos.reduce((sum, d) => sum + d.ausentes, 0)
    const totalIncidencias = totalTardanzas + totalAusentes
    
    // Crear contenido CSV con metadatos
    const csvContent = [
      ['REPORTE DE ESTADÍSTICAS DE ASISTENCIA'],
      [''],
      ['INFORMACIÓN GENERAL'],
      ['Fecha de generación:', fechaActual],
      ['Hora de generación:', horaActual],
      ['Tipo de vista:', vistaActual === 'generales' ? 'Estadísticas Generales' : 'Estadísticas Individuales'],
      ['Aprendiz seleccionado:', vistaActual === 'individual' ? aprendizSeleccionado || 'Ninguno' : 'Todos los aprendices'],
      [''],
      ['RESUMEN EJECUTIVO'],
      ['Total de llegadas tarde:', totalTardanzas],
      ['Total de ausencias:', totalAusentes],
      ['Total de incidencias:', totalIncidencias],
      [''],
      ['DATOS DETALLADOS'],
      [''],
      vistaActual === 'generales' 
        ? ['Fecha', 'Llegadas Tarde', 'No Asistencia', 'Total Incidencias', 'Porcentaje Tardanzas', 'Porcentaje Ausencias']
        : ['Fecha', 'Llegadas Tarde', 'No Asistencia', 'Total Incidencias', 'Porcentaje Tardanzas', 'Porcentaje Ausencias'],
      ...datos.map(d => {
        const totalIncidenciasFecha = d.tardanzas + d.ausentes
        const porcentajeTardanzas = totalIncidenciasFecha > 0 ? ((d.tardanzas / totalIncidenciasFecha) * 100).toFixed(1) : '0.0'
        const porcentajeAusencias = totalIncidenciasFecha > 0 ? ((d.ausentes / totalIncidenciasFecha) * 100).toFixed(1) : '0.0'
        return [
          d.fecha || d.nombre,
          d.tardanzas,
          d.ausentes,
          totalIncidenciasFecha,
          `${porcentajeTardanzas}%`,
          `${porcentajeAusencias}%`
        ]
      }),
      [''],
      ['TOTALES'],
      ['', totalTardanzas, totalAusentes, totalIncidencias, 
       totalIncidencias > 0 ? `${((totalTardanzas / totalIncidencias) * 100).toFixed(1)}%` : '0.0%',
       totalIncidencias > 0 ? `${((totalAusentes / totalIncidencias) * 100).toFixed(1)}%` : '0.0%']
    ]

    // Función para escapar valores CSV
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContentFormatted = csvContent.map(row => 
      row.map(cell => escapeCSV(cell)).join(',')
    ).join('\n')

    // Agregar BOM para UTF-8 para compatibilidad con Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContentFormatted], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `estadisticas_${vistaActual}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para descargar lista de asistencias
  const descargarListaAsistencias = () => {
    const fechaActual = new Date().toLocaleDateString('es-CO')
    const horaActual = new Date().toLocaleTimeString('es-CO')
    
    // Calcular estadísticas generales
    const totalAsistencias = asistencias.length
    const totalPresentes = asistencias.filter(a => a.estado_asistencia === 'presente').length
    const totalTardanzas = asistencias.filter(a => a.estado_asistencia === 'tardanza').length
    const totalAusentes = asistencias.filter(a => a.estado_asistencia === 'ausente').length
    
    // Estadísticas por competencia
    const competenciasMap = new Map()
    asistencias.forEach(a => {
      const key = a.nombre_competencia
      if (!competenciasMap.has(key)) {
        competenciasMap.set(key, {
          nombre: key,
          codigo: a.codigo_competencia,
          total: 0,
          presentes: 0,
          tardanzas: 0,
          ausentes: 0
        })
      }
      const comp = competenciasMap.get(key)
      comp.total++
      if (a.estado_asistencia === 'presente') comp.presentes++
      else if (a.estado_asistencia === 'tardanza') comp.tardanzas++
      else if (a.estado_asistencia === 'ausente') comp.ausentes++
    })
    
    // Estadísticas por aprendiz
    const aprendicesMap = new Map()
    asistencias.forEach(a => {
      const key = `${a.nombre} ${a.apellido}`
      if (!aprendicesMap.has(key)) {
        aprendicesMap.set(key, {
          nombre: a.nombre,
          apellido: a.apellido,
          documento: a.numero_documento,
          total: 0,
          presentes: 0,
          tardanzas: 0,
          ausentes: 0
        })
      }
      const apr = aprendicesMap.get(key)
      apr.total++
      if (a.estado_asistencia === 'presente') apr.presentes++
      else if (a.estado_asistencia === 'tardanza') apr.tardanzas++
      else if (a.estado_asistencia === 'ausente') apr.ausentes++
    })
    
    // Crear contenido CSV completo
    const csvContent = [
      ['REPORTE COMPLETO DE ASISTENCIAS'],
      [''],
      ['INFORMACIÓN GENERAL'],
      ['Fecha de generación:', fechaActual],
      ['Hora de generación:', horaActual],
      ['Total de registros:', totalAsistencias],
      [''],
      ['RESUMEN EJECUTIVO'],
      ['Total de asistencias:', totalAsistencias],
      ['Presentes:', totalPresentes, `(${totalAsistencias > 0 ? ((totalPresentes / totalAsistencias) * 100).toFixed(1) : '0.0'}%)`],
      ['Tardanzas:', totalTardanzas, `(${totalAsistencias > 0 ? ((totalTardanzas / totalAsistencias) * 100).toFixed(1) : '0.0'}%)`],
      ['Ausentes:', totalAusentes, `(${totalAsistencias > 0 ? ((totalAusentes / totalAsistencias) * 100).toFixed(1) : '0.0'}%)`],
      [''],
      ['ESTADÍSTICAS POR COMPETENCIA'],
      [''],
      ['Competencia', 'Código', 'Total', 'Presentes', 'Tardanzas', 'Ausentes', '% Asistencia'],
      ...Array.from(competenciasMap.values()).map(comp => [
        comp.nombre,
        comp.codigo,
        comp.total,
        comp.presentes,
        comp.tardanzas,
        comp.ausentes,
        comp.total > 0 ? `${(((comp.presentes + comp.tardanzas) / comp.total) * 100).toFixed(1)}%)` : '0.0%'
      ]),
      [''],
      ['ESTADÍSTICAS POR APRENDIZ'],
      [''],
      ['Nombre', 'Apellido', 'Documento', 'Total', 'Presentes', 'Tardanzas', 'Ausentes', '% Asistencia'],
      ...Array.from(aprendicesMap.values()).map(apr => [
        apr.nombre,
        apr.apellido,
        apr.documento,
        apr.total,
        apr.presentes,
        apr.tardanzas,
        apr.ausentes,
        apr.total > 0 ? `${(((apr.presentes + apr.tardanzas) / apr.total) * 100).toFixed(1)}%)` : '0.0%'
      ]),
      [''],
      ['DETALLE COMPLETO DE ASISTENCIAS'],
      [''],
      ['Nombre', 'Apellido', 'Documento', 'Competencia', 'Código Competencia', 'Estado Asistencia', 'Fecha Asistencia', 'Hora Registro', 'Nombre Clase', 'Hora Inicio', 'Hora Fin'],
      ...asistencias.map(a => [
        a.nombre,
        a.apellido,
        a.numero_documento,
        a.nombre_competencia,
        a.codigo_competencia,
        a.estado_asistencia,
        new Date(a.fecha_asistencia).toLocaleDateString('es-CO'),
        a.hora_registro || 'No registrada',
        a.nombre_clase || 'N/A',
        a.hora_inicio || 'N/A',
        a.hora_fin || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_completo_asistencias_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para descargar reporte en formato Excel
  const descargarReporteExcel = () => {
    const fechaActual = new Date().toLocaleDateString('es-CO')
    const horaActual = new Date().toLocaleTimeString('es-CO')
    
    // Calcular estadísticas
    const totalAsistencias = asistencias.length
    const totalPresentes = asistencias.filter(a => a.estado_asistencia === 'presente').length
    const totalTardanzas = asistencias.filter(a => a.estado_asistencia === 'tardanza').length
    const totalAusentes = asistencias.filter(a => a.estado_asistencia === 'ausente').length
    
    // Crear HTML que se puede abrir en Excel
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ExcelCreated" content="1">
          <style>
            body { font-family: Arial, sans-serif; }
            .header { background-color: #3B82F6; color: white; padding: 10px; font-weight: bold; }
            .subheader { background-color: #F59E0B; color: white; padding: 8px; font-weight: bold; }
            .data { padding: 5px; border: 1px solid #ccc; }
            .summary { background-color: #f0f0f0; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #e0e0e0; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>REPORTE COMPLETO DE ASISTENCIAS</h1>
          <p><strong>Fecha de generación:</strong> ${fechaActual}</p>
          <p><strong>Hora de generación:</strong> ${horaActual}</p>
          
          <h2 class="header">RESUMEN EJECUTIVO</h2>
          <table>
            <tr><td class="summary">Total de asistencias:</td><td>${totalAsistencias}</td></tr>
            <tr><td class="summary">Presentes:</td><td>${totalPresentes} (${totalAsistencias > 0 ? ((totalPresentes / totalAsistencias) * 100).toFixed(1) : '0.0'}%)</td></tr>
            <tr><td class="summary">Tardanzas:</td><td>${totalTardanzas} (${totalAsistencias > 0 ? ((totalTardanzas / totalAsistencias) * 100).toFixed(1) : '0.0'}%)</td></tr>
            <tr><td class="summary">Ausentes:</td><td>${totalAusentes} (${totalAsistencias > 0 ? ((totalAusentes / totalAsistencias) * 100).toFixed(1) : '0.0'}%)</td></tr>
          </table>
          
          <h2 class="subheader">DETALLE DE ASISTENCIAS</h2>
          <table>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Documento</th>
              <th>Competencia</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Hora Registro</th>
            </tr>
            ${asistencias.map(a => `
              <tr>
                <td class="data">${a.nombre}</td>
                <td class="data">${a.apellido}</td>
                <td class="data">${a.numero_documento}</td>
                <td class="data">${a.nombre_competencia}</td>
                <td class="data">${a.estado_asistencia}</td>
                <td class="data">${new Date(a.fecha_asistencia).toLocaleDateString('es-CO')}</td>
                <td class="data">${a.hora_registro || 'No registrada'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_excel_asistencias_${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para generar PDF
  const descargarPDF = async () => {
    const fechaActual = new Date().toLocaleDateString('es-CO')
    const horaActual = new Date().toLocaleTimeString('es-CO')
    
    // Crear nuevo PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Configurar colores
    const azul = [59, 130, 246] // #3B82F6
    const amarillo = [245, 158, 11] // #F59E0B
    const gris = [107, 114, 128] // #6B7280
    
    // Título principal
    pdf.setFontSize(20)
    pdf.setTextColor(azul[0], azul[1], azul[2])
    pdf.text('📊 ESTADÍSTICAS DE APRENDICES', pageWidth / 2, 20, { align: 'center' })
    
    // Información del reporte
    pdf.setFontSize(10)
    pdf.setTextColor(gris[0], gris[1], gris[2])
    pdf.text(`Fecha de generación: ${fechaActual}`, 20, 35)
    pdf.text(`Hora de generación: ${horaActual}`, 20, 42)
    pdf.text(`Tipo de vista: ${vistaActual === 'generales' ? 'Estadísticas Generales' : 'Estadísticas Individuales'}`, 20, 49)
    if (vistaActual === 'individual' && aprendizSeleccionado) {
      pdf.text(`Aprendiz seleccionado: ${aprendizSeleccionado}`, 20, 56)
    }
    
    // Línea separadora
    pdf.setDrawColor(azul[0], azul[1], azul[2])
    pdf.setLineWidth(0.5)
    pdf.line(20, 65, pageWidth - 20, 65)
    
    // Calcular estadísticas
    const datos = vistaActual === 'generales' ? datosGenerales : datosIndividuales
    const totalTardanzas = datos.reduce((sum, d) => sum + d.tardanzas, 0)
    const totalAusentes = datos.reduce((sum, d) => sum + d.ausentes, 0)
    const totalIncidencias = totalTardanzas + totalAusentes
    
    // Resumen ejecutivo
    pdf.setFontSize(14)
    pdf.setTextColor(azul[0], azul[1], azul[2])
    pdf.text('RESUMEN EJECUTIVO', 20, 80)
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Total de llegadas tarde: ${totalTardanzas}`, 20, 90)
    pdf.text(`Total de ausencias: ${totalAusentes}`, 20, 97)
    pdf.text(`Total de incidencias: ${totalIncidencias}`, 20, 104)
    
    if (totalIncidencias > 0) {
      const porcentajeTardanzas = ((totalTardanzas / totalIncidencias) * 100).toFixed(1)
      const porcentajeAusencias = ((totalAusentes / totalIncidencias) * 100).toFixed(1)
      pdf.text(`Porcentaje de tardanzas: ${porcentajeTardanzas}%`, 20, 111)
      pdf.text(`Porcentaje de ausencias: ${porcentajeAusencias}%`, 20, 118)
    }
    
    // Capturar la gráfica si existe
    if (chartRef.current && vistaActual === 'generales' || (vistaActual === 'individual' && aprendizSeleccionado)) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 150
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // Agregar la gráfica al PDF
        pdf.addImage(imgData, 'PNG', 20, 130, imgWidth, imgHeight)
      } catch (error) {
        console.error('Error al capturar la gráfica:', error)
        pdf.text('Error al generar la gráfica', 20, 130)
      }
    }
    
    // Tabla de datos detallados
    let yPosition = 300
    if (chartRef.current && (vistaActual === 'generales' || (vistaActual === 'individual' && aprendizSeleccionado))) {
      yPosition = 300
    }
    
    pdf.setFontSize(12)
    pdf.setTextColor(azul[0], azul[1], azul[2])
    pdf.text('DATOS DETALLADOS', 20, yPosition)
    
    // Encabezados de la tabla
    pdf.setFontSize(8)
    pdf.setTextColor(0, 0, 0)
    const headers = vistaActual === 'generales' 
      ? ['Fecha', 'Tardanzas', 'Ausentes', 'Total', '% Tardanzas', '% Ausencias']
      : ['Fecha', 'Tardanzas', 'Ausentes', 'Total', '% Tardanzas', '% Ausencias']
    
    let xPosition = 20
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition + 10)
      xPosition += index === 0 ? 30 : 25
    })
    
    // Línea debajo de los encabezados
    pdf.setDrawColor(0, 0, 0)
    pdf.line(20, yPosition + 12, pageWidth - 20, yPosition + 12)
    
    // Datos de la tabla
    yPosition += 20
    datos.forEach((d, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 30
      }
      
      const totalIncidenciasFecha = d.tardanzas + d.ausentes
      const porcentajeTardanzas = totalIncidenciasFecha > 0 ? ((d.tardanzas / totalIncidenciasFecha) * 100).toFixed(1) : '0.0'
      const porcentajeAusencias = totalIncidenciasFecha > 0 ? ((d.ausentes / totalIncidenciasFecha) * 100).toFixed(1) : '0.0'
      
      const rowData = [
        d.fecha || d.nombre,
        d.tardanzas.toString(),
        d.ausentes.toString(),
        totalIncidenciasFecha.toString(),
        `${porcentajeTardanzas}%`,
        `${porcentajeAusencias}%`
      ]
      
      xPosition = 20
      rowData.forEach((data, dataIndex) => {
        pdf.text(data, xPosition, yPosition)
        xPosition += dataIndex === 0 ? 30 : 25
      })
      
      yPosition += 8
    })
    
    // Pie de página
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor(gris[0], gris[1], gris[2])
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10)
      pdf.text('Sistema de Asistencia Académica', 20, pageHeight - 10)
    }
    
    // Descargar el PDF
    pdf.save(`estadisticas_${vistaActual}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Función para hacer scroll suave hacia las estadísticas
  const scrollToEstadisticas = () => {
    if (estadisticasRef.current) {
      estadisticasRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-yellow-50 rounded-2xl shadow-2xl border border-blue-100 p-8 relative">
      {/* Botón flotante para scroll a estadísticas */}
      <button
        onClick={scrollToEstadisticas}
        className="fixed top-20 right-6 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
        title="Ver estadísticas"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">
              📊 Estadísticas de Aprendices
            </h2>
          </div>
          <p className="text-blue-100 text-lg">
            Análisis detallado de asistencia y rendimiento estudiantil
          </p>
        </div>
      </div>

      {/* Lista desplegable de aprendices (solo visible en vista individual) */}
      {vistaActual === 'individual' && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <label className="block text-lg font-semibold text-gray-800">
                👤 Seleccionar Aprendiz
              </label>
            </div>
            <div className="relative">
              <select
                value={aprendizSeleccionado}
                onChange={(e) => setAprendizSeleccionado(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-gray-700 font-medium"
              >
                <option value="">-- Selecciona un aprendiz --</option>
                {obtenerListaAprendices().map((aprendiz) => (
                  <option key={aprendiz.nombre} value={aprendiz.nombre}>
                    {aprendiz.nombre} ({aprendiz.documento})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones de descarga */}
      <div className="flex justify-end mb-8">
        <div className="flex space-x-4">
          <button
            onClick={descargarEstadisticas}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Estadísticas CSV
          </button>
          <button
            onClick={descargarReporteExcel}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reporte Excel
          </button>
          <button
            onClick={descargarPDF}
            className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Gráfica */}
      <div ref={estadisticasRef} className="mb-8">
        {vistaActual === 'individual' && !aprendizSeleccionado ? (
          <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 shadow-inner">
            <div className="text-center p-8">
              <div className="bg-gradient-to-r from-blue-500 to-yellow-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">
                📊 Selecciona un Aprendiz
              </h3>
              <p className="text-lg text-gray-600 mb-2">
                Para ver las estadísticas individuales
              </p>
              <p className="text-sm text-gray-500">
                Usa la lista desplegable de arriba para elegir un estudiante
              </p>
            </div>
          </div>
        ) : (
          <div ref={chartRef} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="h-96">
              <Bar data={getChartData()} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 inline-flex">
          <button
            onClick={() => {
              setVistaActual('individual')
              setAprendizSeleccionado('')
            }}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
              vistaActual === 'individual'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Aprendiz
          </button>
          <button
            onClick={() => {
              setVistaActual('generales')
              setAprendizSeleccionado('')
            }}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
              vistaActual === 'generales'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Aprendices
          </button>
        </div>
      </div>

      {/* Botón de descarga de lista de asistencias */}
      <div className="flex justify-center">
        <button
          onClick={descargarListaAsistencias}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar Lista de Asistencias
        </button>
      </div>
    </div>
  )
}
