'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FiSend } from 'react-icons/fi'
import { useChatbot } from '../../hooks/useChatbot'

interface ChatWidgetProps {
  label?: string
  className?: string
}

export default function ChatWidget({ label, className }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'asistin', text: '¡Hola! Soy Asistín, tu asistente virtual del SAA.\n\nPuedo mostrarte:\n✔️ Estadísticas de asistencia\n✔️ Quiénes llegaron tarde\n✔️ Quiénes no asistieron\n📊 Reportes listos para descargar\n\n✍️ Escríbeme tu consulta y te daré la información en segundos.' }
  ])
  const [input, setInput] = useState('')
  const { processMessage, isLoading, conversationContext, getQuickSuggestions, clearConversationContext } = useChatbot()
  const [showSuggestions, setShowSuggestions] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')
    
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { from: 'user', text: userMessage }])
    
    // Procesar respuesta de Asistín
    try {
      const response = await processMessage(userMessage)
      setMessages(prev => [...prev, { from: 'asistin', text: response.text }])
      
      // Mostrar sugerencias si están disponibles
      if (response.suggestions && response.suggestions.length > 0) {
        setShowSuggestions(true)
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        from: 'asistin', 
        text: 'Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo.' 
      }])
    }
  }

  return (
    <div className={className || "fixed bottom-6 right-6 z-50"}>
      {!open ? (
        // Botón flotante
        <div className="relative inline-flex items-center">
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-[#2F7CF7] pl-5 pr-14 py-2 text-white font-semibold shadow-lg 
                       hover:brightness-105 transition select-none whitespace-nowrap"
          >
{label || "Hola, soy Asistín!"}
          </button>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 
                       h-12 w-12 rounded-full bg-white shadow-lg ring-2 ring-white
                       flex items-center justify-center"
          >
            <Image src="/asistin.png" alt="Asistín" width={34} height={34} className="rounded-full" />
          </span>
        </div>
      ) : (
        // Caja de chat completa
        <div className="flex flex-col w-80 h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#2F7CF7] px-4 py-3 text-white">
            <Image src="/asistin.png" alt="Asistín" width={40} height={40} className="rounded-full bg-white p-1" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Asistín</span>
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                  IA
                </span>
              </div>
              <span className="text-xs text-green-200">Online • Inteligencia Avanzada</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-xl font-bold hover:text-gray-200"
            >
              –
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-blue-100 text-gray-900'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.from === 'asistin' 
                      ? msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/•/g, '&bull;')
                          .replace(/\n/g, '<br>')
                      : msg.text
                  }}
                />
              </div>
            ))}
            
            {/* Indicador de carga */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-blue-100 text-gray-900">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-600">Asistín está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sugerencias Inteligentes */}
          {showSuggestions && (
            <div className="border-t p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">💡 Sugerencias Inteligentes</span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1">
                {getQuickSuggestions().slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(suggestion)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left text-xs p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
              placeholder={isLoading ? "Asistín está procesando..." : "Escribe tu consulta aquí..."}
              disabled={isLoading}
              className={`flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
              title="Sugerencias inteligentes"
            >
              💡
            </button>
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`p-2 ${
                isLoading || !input.trim() 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-500 hover:text-blue-700'
              }`}
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}








