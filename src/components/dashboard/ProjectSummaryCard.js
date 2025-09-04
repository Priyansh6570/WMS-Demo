import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { IndianRupee, Users, Building, Flag } from 'lucide-react';

export default function ProjectSummaryCard({ project }) {
    return (
        <div className="p-4 bg-white border shadow-sm rounded-xl transition-all hover:shadow-md">
            <Link href={`/WMS/projects/${project.id}`}>
                <h4 className="font-bold text-gray-900 truncate">{project.name}</h4>
                <p className="flex items-center text-sm text-gray-500"><Building className="w-3 h-3 mr-1.5"/> {project.monumentName}</p>
            </Link>
            <div className="pt-3 mt-3 border-t">
                <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">Contractor:</span>
                    <span className="font-semibold text-gray-900">{project.contractorName}</span>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                    <span className="font-medium text-gray-600">End Date:</span>
                    <span className="font-semibold text-gray-900">{formatDate(project.timeline.end)}</span>
                </div>
                 <div className="mt-3">
                    <p className="text-xs text-gray-500">Budget</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(project.spentBudget / project.budget) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs font-medium">
                        <span className="text-green-600">₹{project.remainingBudget.toLocaleString('en-IN')} left</span>
                        <span className="text-gray-500">₹{project.budget.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
