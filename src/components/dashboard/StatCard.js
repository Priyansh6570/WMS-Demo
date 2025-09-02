import { cn } from '@/lib/utils'

const colorVariants = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
}

export default function StatCard({ icon: Icon, title, value, color = 'blue' }) {
  return (
    <div className="stat-card">
        <div className="stat-card-content">
            <div>
                <p className="stat-label">{title}</p>
                <p className="stat-number">{value}</p>
            </div>
            <div className={cn('p-3 rounded-full', colorVariants[color])}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    </div>
  )
}