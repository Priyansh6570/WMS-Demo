import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';

export default function ActivityFeed({ activities }) {
    return (
        <div className="p-6 bg-white border shadow-sm rounded-xl">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
                <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                Recent Activity
            </h3>
            <ul className="space-y-4">
                {activities.map((activity, index) => (
                    <li key={index} className="flex items-start space-x-3">
                         <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-300 rounded-full"></div>
                        <div>
                            <p className="text-sm text-gray-800">{activity.text}</p>
                            <Link href={activity.link} className="text-xs text-blue-600 hover:underline">
                                {formatDate(activity.date, { includeTime: true })}
                            </Link>
                        </div>
                    </li>
                ))}
                 {activities.length === 0 && <p className="text-sm text-gray-500">No recent activity.</p>}
            </ul>
        </div>
    );
}
