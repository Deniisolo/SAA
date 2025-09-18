import { useState, useCallback } from 'react'
import { chatbotIntelligence, IntentAnalysis, SmartResponse } from '../lib/chatbot-intelligence'

interface Message {
  from: 'user' | 'asistin'
  text: string
}

interface ChatbotResponse {
  text: string
  data?: any
  suggestions?: string[]
  actions?: any[]
  followUpQuestions?: string[]
}

export function useChatbot() {
  const [isLoading, setIsLoading] = useState(false)
  const [conversationContext, setConversationContext] = useState<any>(null)

  const processMessage = useCallback(async (userMessage: string): Promise<ChatbotResponse> => {
    setIsLoading(true)
    
    try {
      // Análisis inteligente de la intención
      const intentAnalysis: IntentAnalysis = chatbotIntelligence.analyzeIntent(userMessage)
      
      // Generar respuesta inteligente
      const smartResponse: SmartResponse = await chatbotIntelligence.generateSmartResponse(userMessage, intentAnalysis)
      
      // Actualizar contexto de conversación
      setConversationContext(chatbotIntelligence.getContext())
      
      return {
        text: smartResponse.text,
        data: smartResponse.actions,
        suggestions: smartResponse.suggestions,
        actions: smartResponse.actions,
        followUpQuestions: smartResponse.followUpQuestions
      }
      
    } catch (error) {
      console.error('Error procesando mensaje del chatbot:', error)
      return {
        text: 'Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo.'
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Función para obtener sugerencias rápidas
  const getQuickSuggestions = useCallback((): string[] => {
    return [
      'Analiza las estadísticas de asistencia',
      'Identifica estudiantes en riesgo',
      'Compara el rendimiento por competencias',
      'Predice las tendencias del próximo mes',
      'Genera un reporte ejecutivo',
      '¿Cómo está el rendimiento general?'
    ]
  }, [])

  // Función para limpiar el contexto de conversación
  const clearConversationContext = useCallback(() => {
    chatbotIntelligence.clearContext()
    setConversationContext(null)
  }, [])

  return {
    processMessage,
    isLoading,
    conversationContext,
    getQuickSuggestions,
    clearConversationContext
  }
}
