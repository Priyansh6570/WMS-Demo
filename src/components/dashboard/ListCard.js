import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function ListCard({ title, items, linkBase }) {
    return (
        <div className="p-6 bg-white border shadow-sm rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
            <ul className="space-y-3">
                {items.map(item => (
                    <li key={item.id}>
                        <Link href={`${linkBase}/${item.id}`} className="block p-3 transition-colors rounded-lg hover:bg-gray-50">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">
                                {item.projectName ? `Project: ${item.projectName}` : `Due: ${formatDate(item.endDate)}`}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
