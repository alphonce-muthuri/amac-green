export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200"></div>

      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 animate-pulse">
            <div className="h-10 bg-white/20 rounded-full w-40 mx-auto"></div>
            <div className="h-16 bg-white/20 rounded-2xl w-96 mx-auto"></div>
            <div className="h-6 bg-white/20 rounded-xl w-full max-w-3xl mx-auto"></div>
            <div className="flex justify-center gap-4 pt-4">
              <div className="h-8 bg-white/20 rounded-full w-32"></div>
              <div className="h-8 bg-white/20 rounded-full w-32"></div>
              <div className="h-8 bg-white/20 rounded-full w-32"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 lg:flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-16"></div>
              <div className="p-6 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded-lg w-64"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded w-28"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-2 pt-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}