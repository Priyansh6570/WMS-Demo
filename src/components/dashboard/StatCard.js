import { cn } from '@/lib/utils'

const colorVariants = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
}

export default function StatCard({ icon: Icon, title, value, color = 'blue', isLoading }) {
  if (isLoading) {
    return (
      <div className="stat-card">
        <div className="flex items-center justify-between animate-pulse">
            <div>
                <div className="w-24 h-4 mb-2 bg-gray-200 rounded"></div>
                <div className="w-12 h-8 bg-gray-300 rounded"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="stat-card">
        <div className="stat-card-content">
            <div>
                <p className="stat-label">{title}</p>
                <p className="stat-number">{value ?? '0'}</p>
            </div>
            <div className={cn('p-3 rounded-full', colorVariants[color])}>
                {Icon && <Icon className="w-6 h-6" />}
            </div>
        </div>
    </div>
  )
}