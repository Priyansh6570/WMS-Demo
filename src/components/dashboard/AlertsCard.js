import Link from 'next/link';
import { AlertTriangle, Bell } from 'lucide-react';

export default function AlertsCard({ title, items, linkBase, alertType }) {
    return (
        <div className="p-6 bg-white border shadow-sm rounded-xl">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
                <AlertTriangle className={`w-5 h-5 mr-2 ${alertType === 'overdue' ? 'text-red-500' : 'text-yellow-500'}`} />
                {title}
            </h3>
            <ul className="space-y-2">
                {items.map(item => (
                    <li key={item.id}>
                        <Link href={`${linkBase}/${item.id}`} className="block p-2 transition-colors rounded-lg hover:bg-gray-50">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">
                                {alertType === 'overdue' 
                                 ? `${item.timelineAlert.days} days overdue`
                                 : `Starts in ${item.timelineAlert.days} days`
                                }
                            </p>
                        </Link>
                    </li>
                ))}
                 {items.length === 0 && <p className="text-sm text-gray-500">No alerts at this time.</p>}
            </ul>
        </div>
    );
}
