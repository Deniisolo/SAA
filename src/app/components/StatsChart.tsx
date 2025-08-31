'use client'

import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from 'recharts'

type Item = {
  fecha: string
  llegadasTarde: number
  noAsistencia: number
}

export default function StatsChart({
  data,
  height = 360,
}: {
  data: Item[]
  height?: number
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={24}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: 8 }}
            formatter={(v) =>
              v === 'llegadasTarde' ? 'LLEGADAS TARDE' : 'NO ASISTENCIA'
            }
          />
          {/* Colores legibles (azul/amarillo) */}
          <Bar dataKey="llegadasTarde" fill="#2F7CF7" radius={[6, 6, 0, 0]} />
          <Bar dataKey="noAsistencia" fill="#FFC93C" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
