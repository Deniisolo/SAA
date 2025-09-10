'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FiSend } from 'react-icons/fi'

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

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { from: 'user', text: input }])
    setInput('')
    // 👇 Aquí luego puedes conectar lógica para que Asistín responda dinámicamente
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
              <span className="font-semibold">Asistín</span>
              <span className="text-xs text-green-200">Online</span>
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
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu consulta aquí..."
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={sendMessage}
              className="p-2 text-blue-500 hover:text-blue-700"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}








