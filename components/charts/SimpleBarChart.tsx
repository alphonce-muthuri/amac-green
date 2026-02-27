"use client"

interface BarData {
  name: string
  value: number
  percentage?: number
  color?: string
}

interface SimpleBarChartProps {
  data: BarData[]
  height?: number
  showPercentage?: boolean
  horizontal?: boolean
}

export function SimpleBarChart({ data, height = 200, showPercentage = false, horizontal = false }: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

  if (horizontal) {
    return (
      <div className="space-y-3" style={{ height }}>
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-20 text-sm font-medium text-gray-700 truncate">
              {item.name}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || colors[index % colors.length]
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {showPercentage && item.percentage ? `${item.percentage.toFixed(1)}%` : item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex flex-col items-center flex-1 h-full">
            <div className="flex-1 flex items-end w-full">
              <div
                className="w-full rounded-t-md transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                style={{
                  height: `${(item.value / maxValue) * 80}%`,
                  backgroundColor: item.color || colors[index % colors.length],
                  minHeight: '4px'
                }}
                title={`${item.name}: ${showPercentage && item.percentage ? `${item.percentage.toFixed(1)}%` : item.value.toLocaleString()}`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {showPercentage && item.percentage ? `${item.percentage.toFixed(1)}%` : item.value.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-center truncate w-full">
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}