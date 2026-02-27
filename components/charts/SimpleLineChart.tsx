"use client"

import { useMemo } from "react"

interface DataPoint {
  date: string
  revenue: number
  orders: number
}

interface SimpleLineChartProps {
  data: DataPoint[]
  height?: number
  showOrders?: boolean
}

export function SimpleLineChart({ data, height = 200, showOrders = false }: SimpleLineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { points: [], maxValue: 0, labels: [] }

    const values = data.map(d => showOrders ? d.orders : d.revenue)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const range = maxValue - minValue || 1

    const points = data.map((d, index) => {
      const value = showOrders ? d.orders : d.revenue
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - minValue) / range) * 80 // 80% of height for data, 20% for padding
      return { x, y, value, date: d.date }
    })

    const labels = data.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    return { points, maxValue, minValue, labels }
  }, [data, showOrders])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const pathData = chartData.points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Area under curve */}
        <path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill="url(#gradient)"
          opacity="0.1"
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={showOrders ? "#3b82f6" : "#10b981"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {chartData.points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2"
            fill={showOrders ? "#3b82f6" : "#10b981"}
            className="hover:r-3 transition-all cursor-pointer"
          >
            <title>
              {point.date}: {showOrders ? `${point.value} orders` : `KES ${point.value.toLocaleString()}`}
            </title>
          </circle>
        ))}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={showOrders ? "#3b82f6" : "#10b981"} />
            <stop offset="100%" stopColor={showOrders ? "#3b82f6" : "#10b981"} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {chartData.labels.map((label, index) => (
          <span key={index} className={index % 3 === 0 ? '' : 'hidden sm:inline'}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}