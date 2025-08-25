// src/app/components/DataTable.tsx
'use client'

export type Row = {
  fecha: string
  hora: string
  llegada: 'verde' | 'amarillo' | 'rojo'
  nombre: string
  cedula: string
  genero: 'M' | 'F'
  correo: string
  celular: string
  ficha: string
}

const defaultData: Row[] = [
  { fecha:'25/03/2025', hora:'6:20 pm', llegada:'rojo',    nombre:'María Torres',   cedula:'356429', genero:'F', correo:'maria.torres@gmail.com',   celular:'3201112233', ficha:'255001' },
  { fecha:'25/03/2025', hora:'6:00 pm', llegada:'amarillo',nombre:'Juan Peña',      cedula:'245620', genero:'M', correo:'juan.pena@gmail.com',      celular:'3002223344', ficha:'255001' },
  { fecha:'25/03/2025', hora:'6:15 pm', llegada:'verde',   nombre:'Luisa Ruiz',     cedula:'568154', genero:'F', correo:'luisa.ruiz@gmail.com',     celular:'3013334455', ficha:'255002' },
  // … (puedes dejar más mocks si quieres)
]

function Dot({ color }: { color: 'verde'|'amarillo'|'rojo' }) {
  const map = { verde:'bg-green-500', amarillo:'bg-yellow-400', rojo:'bg-red-500' } as const
  return <span className={`inline-block h-3.5 w-3.5 rounded-full ${map[color]}`} />
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-800 ${className}`}>{children}</td>
}

export default function DataTable({ data }: { data?: Row[] }) {
  const rows = data ?? defaultData
  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            <Th>Fecha</Th>
            <Th>Hora</Th>
            <Th className="text-center">Llegada</Th>
            <Th>Nombres y Apellidos</Th>
            <Th>Cédula</Th>
            <Th>Género</Th>
            <Th>Correo</Th>
            <Th>Celular</Th>
            <Th>Ficha</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="even:bg-gray-50">
              <Td>{r.fecha}</Td>
              <Td>{r.hora}</Td>
              <Td className="text-center"><Dot color={r.llegada} /></Td>
              <Td>{r.nombre}</Td>
              <Td>{r.cedula}</Td>
              <Td>{r.genero}</Td>
              <Td className="truncate max-w-[220px]">{r.correo}</Td>
              <Td>{r.celular}</Td>
              <Td>{r.ficha}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


