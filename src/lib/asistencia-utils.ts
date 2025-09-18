/**
 * Utilidades para el sistema de semáforo de asistencia
 */

export type EstadoAsistencia = 'presente' | 'tardanza' | 'ausente';

export interface ConfiguracionSemáforo {
  toleranciaMinutos: number; // Tiempo de tolerancia para considerar tardanza
  horarioInicio: string; // Hora de inicio de la clase (formato HH:MM)
}

/**
 * Configuración por defecto del semáforo
 */
export const CONFIGURACION_DEFAULT: ConfiguracionSemáforo = {
  toleranciaMinutos: 15, // 15 minutos de tolerancia
  horarioInicio: '08:00' // Hora por defecto
};

/**
 * Determina el estado de asistencia basado en la hora de llegada
 * @param horaInicioClase Hora de inicio de la clase (formato HH:MM)
 * @param horaRegistro Hora de registro de asistencia (formato HH:MM)
 * @param toleranciaMinutos Minutos de tolerancia para tardanza
 * @returns Estado de asistencia
 */
export function determinarEstadoAsistencia(
  horaInicioClase: string,
  horaRegistro: string,
  toleranciaMinutos: number = CONFIGURACION_DEFAULT.toleranciaMinutos
): EstadoAsistencia {
  const [horaInicio, minutoInicio] = horaInicioClase.split(':').map(Number);
  const [horaReg, minutoReg] = horaRegistro.split(':').map(Number);
  
  // Convertir a minutos desde medianoche para facilitar cálculos
  const minutosInicio = horaInicio * 60 + minutoInicio;
  const minutosRegistro = horaReg * 60 + minutoReg;
  
  const diferenciaMinutos = minutosRegistro - minutosInicio;
  
  if (diferenciaMinutos <= 0) {
    return 'presente'; // Llegó a tiempo o antes
  } else if (diferenciaMinutos <= toleranciaMinutos) {
    return 'tardanza'; // Llegó dentro de los 15 minutos de tolerancia (amarillo)
  } else {
    return 'ausente'; // Llegó muy tarde, después de la tolerancia (rojo)
  }
}

/**
 * Obtiene el color del semáforo para un estado de asistencia
 * @param estado Estado de asistencia
 * @returns Color en formato hexadecimal
 */
export function obtenerColorSemáforo(estado: EstadoAsistencia): string {
  switch (estado) {
    case 'presente':
      return '#10B981'; // Verde
    case 'tardanza':
      return '#F59E0B'; // Amarillo
    case 'ausente':
      return '#EF4444'; // Rojo
    default:
      return '#6B7280'; // Gris por defecto
  }
}

/**
 * Obtiene el nombre del color para CSS
 * @param estado Estado de asistencia
 * @returns Nombre del color para clases CSS
 */
export function obtenerClaseColorSemáforo(estado: EstadoAsistencia): string {
  switch (estado) {
    case 'presente':
      return 'bg-green-500';
    case 'tardanza':
      return 'bg-yellow-500';
    case 'ausente':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Obtiene el texto descriptivo del estado
 * @param estado Estado de asistencia
 * @returns Texto descriptivo
 */
export function obtenerTextoEstado(estado: EstadoAsistencia): string {
  switch (estado) {
    case 'presente':
      return 'Presente';
    case 'tardanza':
      return 'Tardanza';
    case 'ausente':
      return 'Ausente';
    default:
      return 'Sin registro';
  }
}

/**
 * Obtiene el emoji del semáforo
 * @param estado Estado de asistencia
 * @returns Emoji representativo
 */
export function obtenerEmojiSemáforo(estado: EstadoAsistencia): string {
  switch (estado) {
    case 'presente':
      return '🟢';
    case 'tardanza':
      return '🟡';
    case 'ausente':
      return '🔴';
    default:
      return '⚪';
  }
}

/**
 * Calcula estadísticas de asistencia para una clase
 * @param asistencias Array de asistencias
 * @returns Estadísticas de asistencia
 */
export interface EstadisticasAsistencia {
  total: number;
  presentes: number;
  tardanzas: number;
  ausentes: number;
  porcentajeAsistencia: number;
}

export function calcularEstadisticasAsistencia(asistencias: Array<{ estado_asistencia: EstadoAsistencia }>): EstadisticasAsistencia {
  const total = asistencias.length;
  const presentes = asistencias.filter(a => a.estado_asistencia === 'presente').length;
  const tardanzas = asistencias.filter(a => a.estado_asistencia === 'tardanza').length;
  const ausentes = asistencias.filter(a => a.estado_asistencia === 'ausente').length;
  
  const porcentajeAsistencia = total > 0 ? Math.round(((presentes + tardanzas) / total) * 100) : 0;
  
  return {
    total,
    presentes,
    tardanzas,
    ausentes,
    porcentajeAsistencia
  };
}

/**
 * Formatea la hora para mostrar en la interfaz
 * @param hora Hora en formato HH:MM
 * @returns Hora formateada
 */
export function formatearHora(hora: string): string {
  return hora;
}

/**
 * Valida si una hora está en formato correcto
 * @param hora Hora a validar
 * @returns true si es válida, false si no
 */
export function validarFormatoHora(hora: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
}
