import { Phone, User } from 'lucide-react'

export default function WorkerList({ workers }) {
  return (
    <div className="text-gray-700 divide-y divide-gray-200">
      {workers.length > 0 ? workers.map(worker => (
        <div key={worker.id} className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full"><User className="w-5 h-5 text-gray-600" /></div>
            <div>
              <p className="font-medium text-gray-900">{worker.name}</p>
              <p className="flex items-center text-sm text-gray-500"><Phone className="h-3 w-3 mr-1.5" />{worker.mobile}</p>
            </div>
          </div>
        </div>
      )) : (
        <p className="p-4 text-sm text-center text-gray-500">No workers assigned.</p>
      )}
    </div>
  )
}