'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMemo, useState } from 'react'

type SeriesPoint = { month: string; collected: number; outstanding: number }

export default function CollectionsAreaChart({
  series,
  onPointClick,
}: {
  series: SeriesPoint[]
  onPointClick?: (month: string) => void
}) {
  const [range, setRange] = useState<'3M' | '6M' | '12M'>('12M')
  const data = useMemo(() => {
    const n = range === '3M' ? 3 : range === '6M' ? 6 : 12
    return series.slice(-n)
  }, [series, range])

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(['3M', '6M', '12M'] as const).map((r) => (
          <button
            key={r}
            className={`px-2 py-1 text-xs rounded border ${range === r ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            onClick={() => setRange(r)}
            aria-pressed={range === r}
          >{r}</button>
        ))}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} onClick={(e) => {
            const m = e && (e as any).activeLabel
            if (m && onPointClick) onPointClick(m)
          }}>
            <defs>
              <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="outstanding" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="collected" stroke="hsl(var(--primary))" fill="url(#collected)" />
            <Area type="monotone" dataKey="outstanding" stroke="hsl(var(--destructive))" fill="url(#outstanding)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

