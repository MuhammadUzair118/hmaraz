'use client'

interface DataPoint {
  time: string
  value: number
}

interface VitalChartProps {
  data: DataPoint[]
  baseline?: number
  label: string
  unit: string
}

export default function VitalChart({ data, baseline, label, unit }: VitalChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-gray-50 text-sm text-muted-gray">
        No data available
      </div>
    )
  }

  const values = data.map(d => d.value)
  const max = Math.max(...values) * 1.2
  const min = Math.min(...values) * 0.8
  const range = max - min || 1

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-dark-slate">{label}</h3>
        <span className="text-xs text-muted-gray">{unit}</span>
      </div>
      <div className="relative h-40">
        <svg className="h-full w-full" viewBox={`0 0 ${data.length * 20} 100`} preserveAspectRatio="none">
          {baseline && (
            <line
              x1="0" y1={100 - ((baseline - min) / range) * 90 - 5}
              x2={data.length * 20} y2={100 - ((baseline - min) / range) * 90 - 5}
              stroke="#0EA5E9" strokeWidth="1" strokeDasharray="4,4" opacity={0.5}
            />
          )}
          <polyline
            fill="none"
            stroke="#1E40AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((d, i) => `${i * 20 + 10},${100 - ((d.value - min) / range) * 90 - 5}`).join(' ')}
          />
        </svg>
        {baseline && (
          <span className="absolute bottom-0 right-0 text-[10px] text-sky-accent">baseline</span>
        )}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-gray">
        <span>{data[0]?.time ?? ''}</span>
        <span>{data[data.length - 1]?.time ?? ''}</span>
      </div>
    </div>
  )
}
