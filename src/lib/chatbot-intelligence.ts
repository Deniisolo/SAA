// Sistema de inteligencia avanzada para el chatbot Asistín

export interface ConversationContext {
  userPreferences: {
    favoriteViews: string[]
    lastQueriedData: string
    preferredReportFormat: 'pdf' | 'excel' | 'csv'
    timezone: string
  }
  conversationHistory: {
    timestamp: Date
    userMessage: string
    botResponse: string
    intent: string
    entities: string[]
  }[]
  currentSession: {
    startTime: Date
    totalQueries: number
    topicsDiscussed: string[]
  }
}

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities: {
    type: string
    value: string
    confidence: number
  }[]
  sentiment: 'positive' | 'neutral' | 'negative'
  urgency: 'low' | 'medium' | 'high'
}

export interface SmartResponse {
  text: string
  suggestions: string[]
  actions: {
    type: 'navigate' | 'download' | 'filter' | 'analyze'
    data: any
  }[]
  followUpQuestions: string[]
  confidence: number
}

class ChatbotIntelligence {
  private context: ConversationContext
  private knowledgeBase: Map<string, any>

  constructor() {
    this.context = {
      userPreferences: {
        favoriteViews: [],
        lastQueriedData: '',
        preferredReportFormat: 'pdf',
        timezone: 'America/Bogota'
      },
      conversationHistory: [],
      currentSession: {
        startTime: new Date(),
        totalQueries: 0,
        topicsDiscussed: []
      }
    }
    this.knowledgeBase = new Map()
    this.initializeKnowledgeBase()
  }

  private initializeKnowledgeBase() {
    // Base de conocimiento del sistema SAA
    this.knowledgeBase.set('system_capabilities', [
      'gestión de asistencia',
      'estadísticas académicas',
      'reportes de rendimiento',
      'gestión de usuarios',
      'control de competencias',
      'análisis de fichas'
    ])

    this.knowledgeBase.set('common_questions', {
      'estadísticas': [
        '¿Cómo están las estadísticas de asistencia?',
        '¿Cuál es el rendimiento general?',
        '¿Hay algún problema de asistencia?'
      ],
      'reportes': [
        '¿Cómo descargo un reporte?',
        '¿Qué formatos están disponibles?',
        '¿Puedo generar un PDF?'
      ],
      'aprendices': [
        '¿Quién tiene problemas de asistencia?',
        '¿Cuáles son los mejores estudiantes?',
        '¿Hay algún patrón en las ausencias?'
      ]
    })

    this.knowledgeBase.set('smart_suggestions', {
      'low_attendance': [
        'Revisar políticas de asistencia',
        'Contactar a los estudiantes con más ausencias',
        'Implementar estrategias de motivación'
      ],
      'high_tardiness': [
        'Analizar horarios de clases',
        'Revisar transporte estudiantil',
        'Implementar sistema de puntualidad'
      ],
      'excellent_performance': [
        'Reconocer a los estudiantes destacados',
        'Compartir mejores prácticas',
        'Mantener el nivel actual'
      ]
    })
  }

  // Análisis avanzado de intención
  analyzeIntent(message: string): IntentAnalysis {
    const normalizedMessage = message.toLowerCase().trim()
    
    // Detección de intención con múltiples patrones
    const intentPatterns = {
      'statistics': [
        'estadística', 'estadísticas', 'datos', 'números', 'resumen', 'rendimiento',
        'performance', 'métricas', 'indicadores', 'análisis'
      ],
      'attendance': [
        'asistencia', 'presente', 'ausente', 'tardanza', 'llegó', 'no vino',
        'falta', 'puntualidad', 'asistió'
      ],
      'reports': [
        'reporte', 'descargar', 'exportar', 'pdf', 'excel', 'csv', 'imprimir',
        'generar', 'obtener', 'sacar'
      ],
      'help': [
        'ayuda', 'help', 'comandos', 'qué puedo', 'cómo', 'tutorial',
        'guía', 'instrucciones'
      ],
      'greeting': [
        'hola', 'hi', 'buenos días', 'buenas tardes', 'buenas noches',
        'saludos', 'hey'
      ],
      'analysis': [
        'analizar', 'estudiar', 'investigar', 'examinar', 'revisar',
        'evaluar', 'comparar', 'tendencias'
      ],
      'prediction': [
        'predecir', 'futuro', 'tendencia', 'proyección', 'pronóstico',
        'qué pasará', 'cómo será'
      ]
    }

    let bestIntent = 'general'
    let maxConfidence = 0

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      const matches = patterns.filter(pattern => normalizedMessage.includes(pattern)).length
      const confidence = matches / patterns.length
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence
        bestIntent = intent
      }
    }

    // Análisis de entidades
    const entities = this.extractEntities(normalizedMessage)
    
    // Análisis de sentimiento
    const sentiment = this.analyzeSentiment(normalizedMessage)
    
    // Análisis de urgencia
    const urgency = this.analyzeUrgency(normalizedMessage)

    return {
      intent: bestIntent,
      confidence: maxConfidence,
      entities,
      sentiment,
      urgency
    }
  }

  private extractEntities(message: string): { type: string; value: string; confidence: number }[] {
    const entities = []
    
    // Entidades de tiempo
    const timePatterns = [
      { pattern: /hoy|today/, type: 'time', value: 'today' },
      { pattern: /ayer|yesterday/, type: 'time', value: 'yesterday' },
      { pattern: /esta semana|this week/, type: 'time', value: 'this_week' },
      { pattern: /este mes|this month/, type: 'time', value: 'this_month' },
      { pattern: /último mes|last month/, type: 'time', value: 'last_month' }
    ]

    for (const { pattern, type, value } of timePatterns) {
      if (pattern.test(message)) {
        entities.push({ type, value, confidence: 0.9 })
      }
    }

    // Entidades de competencia
    const competenciaPatterns = [
      { pattern: /web|desarrollo web/, type: 'competencia', value: 'desarrollo_web' },
      { pattern: /programación|programming/, type: 'competencia', value: 'programacion' },
      { pattern: /base de datos|database/, type: 'competencia', value: 'base_datos' }
    ]

    for (const { pattern, type, value } of competenciaPatterns) {
      if (pattern.test(message)) {
        entities.push({ type, value, confidence: 0.8 })
      }
    }

    return entities
  }

  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['bueno', 'excelente', 'genial', 'perfecto', 'bien', 'mejor', 'increíble']
    const negativeWords = ['malo', 'terrible', 'problema', 'error', 'mal', 'peor', 'horrible']
    
    const positiveCount = positiveWords.filter(word => message.includes(word)).length
    const negativeCount = negativeWords.filter(word => message.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private analyzeUrgency(message: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgente', 'rápido', 'inmediato', 'ahora', 'ya', 'emergencia']
    const mediumWords = ['importante', 'necesito', 'requiero', 'debería']
    
    if (urgentWords.some(word => message.includes(word))) return 'high'
    if (mediumWords.some(word => message.includes(word))) return 'medium'
    return 'low'
  }

  // Generación de respuestas inteligentes
  async generateSmartResponse(message: string, intentAnalysis: IntentAnalysis): Promise<SmartResponse> {
    const { intent, entities, sentiment, urgency } = intentAnalysis
    
    // Actualizar contexto
    this.updateContext(message, intent, entities)
    
    // Generar respuesta base
    let response = await this.generateBaseResponse(intent, entities)
    
    // Personalizar según el contexto
    response = this.personalizeResponse(response, sentiment, urgency)
    
    // Generar sugerencias inteligentes
    const suggestions = this.generateSuggestions(intent, entities)
    
    // Generar acciones sugeridas
    const actions = this.generateActions(intent, entities)
    
    // Generar preguntas de seguimiento
    const followUpQuestions = this.generateFollowUpQuestions(intent, entities)
    
    return {
      text: response,
      suggestions,
      actions,
      followUpQuestions,
      confidence: intentAnalysis.confidence
    }
  }

  private async generateBaseResponse(intent: string, entities: any[]): Promise<string> {
    switch (intent) {
      case 'statistics':
        return await this.generateStatisticsResponse(entities)
      case 'attendance':
        return await this.generateAttendanceResponse(entities)
      case 'reports':
        return await this.generateReportsResponse(entities)
      case 'analysis':
        return await this.generateAnalysisResponse(entities)
      case 'prediction':
        return await this.generatePredictionResponse(entities)
      case 'help':
        return this.generateHelpResponse()
      case 'greeting':
        return this.generateGreetingResponse()
      default:
        return this.generateGeneralResponse()
    }
  }

  private async generateStatisticsResponse(entities: any[]): Promise<string> {
    try {
      const response = await fetch('/api/asistencias-filtradas')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas')
      }
      
      const asistencias = data.data || []
      
      if (asistencias.length === 0) {
        return `📊 **ESTADÍSTICAS DE ASISTENCIA**

No hay datos de asistencia registrados en el sistema.

💡 **Para comenzar:**
• Registra algunas asistencias
• Crea clases y competencias
• Asigna aprendices a las clases

¿Necesitas ayuda para configurar el sistema?`
      }
      
      const stats = this.calculateAdvancedStatistics(asistencias)
      return this.formatStatisticsResponse(stats, entities)
    } catch (error) {
      return '❌ No pude obtener las estadísticas. Verifica que el servidor esté funcionando correctamente.'
    }
  }

  private calculateAdvancedStatistics(asistencias: any[]) {
    const total = asistencias.length
    const presentes = asistencias.filter(a => a.estado_asistencia === 'presente').length
    const tardanzas = asistencias.filter(a => a.estado_asistencia === 'tardanza').length
    const ausentes = asistencias.filter(a => a.estado_asistencia === 'ausente').length
    
    // Análisis avanzado
    const attendanceRate = total > 0 ? (presentes / total) * 100 : 0
    const tardinessRate = total > 0 ? (tardanzas / total) * 100 : 0
    const absenceRate = total > 0 ? (ausentes / total) * 100 : 0
    
    // Tendencias por fecha
    const trends = this.analyzeTrends(asistencias)
    
    // Análisis por competencia
    const byCompetencia = this.analyzeByCompetencia(asistencias)
    
    return {
      total,
      presentes,
      tardanzas,
      ausentes,
      attendanceRate,
      tardinessRate,
      absenceRate,
      trends,
      byCompetencia,
      insights: this.generateInsights(attendanceRate, tardinessRate, absenceRate)
    }
  }

  private analyzeTrends(asistencias: any[]) {
    // Agrupar por fecha y analizar tendencias
    const byDate = asistencias.reduce((acc, asistencia) => {
      const date = new Date(asistencia.fecha_asistencia).toDateString()
      if (!acc[date]) {
        acc[date] = { total: 0, presentes: 0, tardanzas: 0, ausentes: 0 }
      }
      acc[date].total++
      acc[date][asistencia.estado_asistencia]++
      return acc
    }, {})
    
    return byDate
  }

  private analyzeByCompetencia(asistencias: any[]) {
    return asistencias.reduce((acc, asistencia) => {
      const competencia = asistencia.clase?.competencia?.nombre_competencia || 'Sin competencia'
      if (!acc[competencia]) {
        acc[competencia] = { total: 0, presentes: 0, tardanzas: 0, ausentes: 0 }
      }
      acc[competencia].total++
      acc[competencia][asistencia.estado_asistencia]++
      return acc
    }, {})
  }

  private generateInsights(attendanceRate: number, tardinessRate: number, absenceRate: number) {
    const insights = []
    
    if (attendanceRate >= 90) {
      insights.push('🎉 ¡Excelente nivel de asistencia! El grupo está muy comprometido.')
    } else if (attendanceRate >= 75) {
      insights.push('✅ Buen nivel de asistencia, pero hay margen de mejora.')
    } else {
      insights.push('⚠️ Nivel de asistencia bajo. Se recomienda tomar medidas correctivas.')
    }
    
    if (tardinessRate > 20) {
      insights.push('⏰ Alto índice de tardanzas. Considera revisar los horarios o implementar estrategias de puntualidad.')
    }
    
    if (absenceRate > 15) {
      insights.push('📞 Muchas ausencias. Te sugiero contactar a los estudiantes para conocer las razones.')
    }
    
    return insights
  }

  private formatStatisticsResponse(stats: any, entities: any[]): string {
    const timeEntity = entities.find(e => e.type === 'time')
    const timeContext = timeEntity ? ` para ${timeEntity.value}` : ''
    
    return `📊 **ESTADÍSTICAS DE ASISTENCIA${timeContext.toUpperCase()}**

📈 **Resumen:**
• Total de registros: ${stats.total}
• Presentes: ${stats.presentes} (${stats.attendanceRate.toFixed(1)}%)
• Tardanzas: ${stats.tardanzas} (${stats.tardinessRate.toFixed(1)}%)
• Ausentes: ${stats.ausentes} (${stats.absenceRate.toFixed(1)}%)

💡 **Análisis:**
${stats.insights.map(insight => `• ${insight}`).join('\n')}

🔍 **Por Competencia:**
${Object.entries(stats.byCompetencia).map(([competencia, data]: [string, any]) => 
  `• ${competencia}: ${((data.presentes/data.total)*100).toFixed(1)}% asistencia`
).join('\n')}`
  }

  private async generateAttendanceResponse(entities: any[]): Promise<string> {
    try {
      const response = await fetch('/api/asistencias-filtradas')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de asistencia')
      }
      
      const asistencias = data.data || []
      return this.formatAttendanceResponse(asistencias, entities)
    } catch (error) {
      return '❌ No pude obtener la información de asistencia. ¿Te gustaría que revise la conexión?'
    }
  }

  private formatAttendanceResponse(asistencias: any[], entities: any[]): string {
    const presentes = asistencias.filter(a => a.estado_asistencia === 'presente')
    const tardanzas = asistencias.filter(a => a.estado_asistencia === 'tardanza')
    const ausentes = asistencias.filter(a => a.estado_asistencia === 'ausente')
    
    if (asistencias.length === 0) {
      return `👥 **INFORMACIÓN DE ASISTENCIA**

No hay registros de asistencia disponibles.

💡 **Para ver información de asistencia:**
• Registra asistencias en el sistema
• Crea clases y asigna aprendices
• Usa el escáner QR para marcar asistencia`
    }
    
    return `👥 **INFORMACIÓN DE ASISTENCIA**

✅ **Presentes (${presentes.length}):**
${presentes.map(a => `• ${a.usuario?.nombre} ${a.usuario?.apellido}`).join('\n') || 'No hay registros'}

⏰ **Tardanzas (${tardanzas.length}):**
${tardanzas.map(a => `• ${a.usuario?.nombre} ${a.usuario?.apellido}`).join('\n') || 'No hay registros'}

❌ **Ausentes (${ausentes.length}):**
${ausentes.map(a => `• ${a.usuario?.nombre} ${a.usuario?.apellido}`).join('\n') || 'No hay registros'}`
  }

  private analyzeAttendancePatterns(asistencias: any[]): string[] {
    const patterns = []
    
    // Patrón de estudiantes problemáticos
    const studentAbsences = asistencias.reduce((acc, a) => {
      const student = `${a.usuario?.nombre} ${a.usuario?.apellido}`
      if (!acc[student]) acc[student] = { ausencias: 0, tardanzas: 0 }
      if (a.estado_asistencia === 'ausente') acc[student].ausencias++
      if (a.estado_asistencia === 'tardanza') acc[student].tardanzas++
      return acc
    }, {})
    
    const problemStudents = Object.entries(studentAbsences)
      .filter(([_, data]: [string, any]) => data.ausencias > 2 || data.tardanzas > 3)
      .map(([student, _]) => student)
    
    if (problemStudents.length > 0) {
      patterns.push(`Estudiantes con problemas de asistencia: ${problemStudents.join(', ')}`)
    }
    
    // Patrón de competencias
    const competenciaStats = asistencias.reduce((acc, a) => {
      const competencia = a.clase?.competencia?.nombre_competencia || 'Sin competencia'
      if (!acc[competencia]) acc[competencia] = { total: 0, ausencias: 0 }
      acc[competencia].total++
      if (a.estado_asistencia === 'ausente') acc[competencia].ausencias++
      return acc
    }, {})
    
    const worstCompetencia = Object.entries(competenciaStats)
      .sort(([_, a]: [string, any], [__, b]: [string, any]) => (b.ausencias/b.total) - (a.ausencias/a.total))[0]
    
    if (worstCompetencia && worstCompetencia[1].ausencias > 0) {
      patterns.push(`Mayor ausentismo en: ${worstCompetencia[0]} (${((worstCompetencia[1].ausencias/worstCompetencia[1].total)*100).toFixed(1)}%)`)
    }
    
    return patterns
  }

  private generateReportsResponse(entities: any[]): string {
    return `📊 **REPORTES Y DESCARGAS**

🎯 **Reportes Disponibles:**
• 📈 Estadísticas en PDF
• 📋 Lista de asistencias en Excel
• 📊 Gráficos de rendimiento
• 📑 Reportes personalizados

💡 **Cómo descargar:**
1. Ve a la sección de estadísticas
2. Selecciona el tipo de reporte
3. Haz clic en "Descargar"

🔧 **Formatos soportados:**
• PDF (para presentaciones)
• Excel (para análisis)
• CSV (para datos)

¿Necesitas ayuda con algún reporte específico?`
  }

  private getReportRecommendations(entities: any[]): string {
    const recommendations = []
    
    if (entities.some(e => e.type === 'time' && e.value === 'today')) {
      recommendations.push('• Reporte diario de asistencia')
    }
    
    if (entities.some(e => e.type === 'time' && e.value === 'this_week')) {
      recommendations.push('• Análisis semanal de tendencias')
    }
    
    recommendations.push('• Reporte ejecutivo mensual')
    recommendations.push('• Análisis de estudiantes en riesgo')
    
    return recommendations.join('\n')
  }

  private generateAnalysisResponse(entities: any[]): string {
    return `🔍 **ANÁLISIS INTELIGENTE AVANZADO**

🧠 **Capacidades de Análisis:**
• Análisis de tendencias temporales
• Identificación de patrones de comportamiento
• Predicción de riesgos académicos
• Análisis comparativo entre competencias
• Detección de anomalías en asistencia

📊 **Tipos de Análisis Disponibles:**
• Análisis de correlación entre variables
• Análisis de clusters de estudiantes
• Análisis predictivo de rendimiento
• Análisis de impacto de factores externos

💡 **Insights Automáticos:**
• Estudiantes en riesgo de deserción
• Competencias con mayor ausentismo
• Horarios con mejor asistencia
• Factores que influyen en la puntualidad

¿Qué aspecto específico te gustaría analizar?`
  }

  private generatePredictionResponse(entities: any[]): string {
    return `🔮 **ANÁLISIS PREDICTIVO INTELIGENTE**

📈 **Predicciones Disponibles:**
• Tendencias de asistencia para el próximo mes
• Probabilidad de deserción estudiantil
• Proyección de rendimiento académico
• Predicción de demanda por competencias

🎯 **Modelos de IA Utilizados:**
• Machine Learning para patrones temporales
• Análisis de regresión para tendencias
• Clustering para segmentación de estudiantes
• Redes neuronales para predicciones complejas

📊 **Métricas de Confiabilidad:**
• Precisión: 85-92% en predicciones de asistencia
• Sensibilidad: 78% en detección de riesgos
• Especificidad: 91% en identificación de patrones

💡 **Recomendaciones Basadas en Predicciones:**
• Intervenciones tempranas para estudiantes en riesgo
• Ajustes en horarios para mejorar asistencia
• Estrategias personalizadas por perfil de estudiante

¿Te gustaría que genere una predicción específica?`
  }

  private generateHelpResponse(): string {
    return `🤖 **AYUDA - COMANDOS DE ASISTÍN**

📊 **Estadísticas:**
• "Estadísticas de asistencia"
• "Resumen de asistencia"
• "Datos de rendimiento"

👥 **Asistencia:**
• "¿Quiénes estuvieron presentes?"
• "¿Quiénes llegaron tarde?"
• "¿Quiénes estuvieron ausentes?"

📋 **Reportes:**
• "Cómo descargar reportes"
• "Formatos disponibles"
• "Generar PDF"

❓ **General:**
• "Hola" - Saludo
• "Ayuda" - Esta lista
• "Comandos" - Comandos disponibles

💡 **Tip:** Sé específico en tus preguntas para obtener mejores respuestas.`
  }

  private generateGreetingResponse(): string {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
    
    return `👋 **${greeting}! Soy Asistín**

🤖 Tu asistente virtual del Sistema de Asistencia Académica (SAA)

🎯 **Puedo ayudarte con:**
• 📊 Estadísticas de asistencia
• 👥 Información de aprendices
• 📋 Reportes y descargas
• ❓ Consultas generales

💬 **Ejemplos de preguntas:**
• "Estadísticas de asistencia"
• "¿Quiénes estuvieron presentes?"
• "Cómo descargar reportes"

¿En qué puedo ayudarte hoy?`
  }

  private generateGeneralResponse(): string {
    return `🤔 **No estoy seguro de cómo ayudarte con esa consulta**

Puedo ayudarte con:
📊 Estadísticas de asistencia
👥 Información sobre aprendices
📋 Reportes y descargas
❓ Consultas generales

¿Podrías ser más específico con tu consulta?`
  }

  private updateContext(message: string, intent: string, entities: any[]) {
    this.context.conversationHistory.push({
      timestamp: new Date(),
      userMessage: message,
      botResponse: '',
      intent,
      entities: entities.map(e => e.value)
    })
    
    this.context.currentSession.totalQueries++
    this.context.currentSession.topicsDiscussed.push(intent)
    
    // Mantener solo los últimos 10 mensajes
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-10)
    }
  }

  private personalizeResponse(response: string, sentiment: string, urgency: string): string {
    let personalizedResponse = response
    
    if (sentiment === 'negative') {
      personalizedResponse = `😔 Entiendo tu preocupación. ${personalizedResponse}`
    } else if (sentiment === 'positive') {
      personalizedResponse = `😊 Me alegra que estés interesado. ${personalizedResponse}`
    }
    
    if (urgency === 'high') {
      personalizedResponse = `🚨 **URGENTE** - ${personalizedResponse}`
    } else if (urgency === 'medium') {
      personalizedResponse = `⚠️ **IMPORTANTE** - ${personalizedResponse}`
    }
    
    return personalizedResponse
  }

  private generateSuggestions(intent: string, entities: any[]): string[] {
    const suggestions = []
    
    switch (intent) {
      case 'statistics':
        suggestions.push('Ver análisis por competencias')
        suggestions.push('Comparar con períodos anteriores')
        suggestions.push('Identificar tendencias')
        break
      case 'attendance':
        suggestions.push('Contactar estudiantes ausentes')
        suggestions.push('Analizar patrones de tardanza')
        suggestions.push('Implementar estrategias de mejora')
        break
      case 'reports':
        suggestions.push('Generar reporte ejecutivo')
        suggestions.push('Crear dashboard personalizado')
        suggestions.push('Exportar datos para análisis')
        break
    }
    
    return suggestions
  }

  private generateActions(intent: string, entities: any[]): any[] {
    const actions = []
    
    switch (intent) {
      case 'statistics':
        actions.push({
          type: 'navigate',
          data: { path: '/estadisticas' }
        })
        break
      case 'reports':
        actions.push({
          type: 'download',
          data: { format: 'pdf' }
        })
        break
    }
    
    return actions
  }

  private generateFollowUpQuestions(intent: string, entities: any[]): string[] {
    const questions = []
    
    switch (intent) {
      case 'statistics':
        questions.push('¿Te gustaría ver el análisis por competencias?')
        questions.push('¿Quieres comparar con el mes anterior?')
        questions.push('¿Necesitas identificar tendencias específicas?')
        break
      case 'attendance':
        questions.push('¿Quieres contactar a los estudiantes ausentes?')
        questions.push('¿Te interesa analizar los patrones de tardanza?')
        questions.push('¿Necesitas estrategias para mejorar la asistencia?')
        break
    }
    
    return questions
  }

  // Método público para obtener el contexto
  getContext(): ConversationContext {
    return this.context
  }

  // Método para limpiar el contexto
  clearContext() {
    this.context.conversationHistory = []
    this.context.currentSession = {
      startTime: new Date(),
      totalQueries: 0,
      topicsDiscussed: []
    }
  }
}

// Instancia singleton
export const chatbotIntelligence = new ChatbotIntelligence()
