'use client'

import MonumentForm from '@/components/monuments/MonumentForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CreateMonumentPage() {
  return (
    <div>
        <Link href="/WMS/monuments" className="inline-flex items-center mb-4 text-sm text-gray-700 hover:text-gray-900">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Monuments
        </Link>
      <h1 className="mb-6 text-3xl font-bold text-gray-700">Add New Monument</h1>
      <div className="p-6 card">
        <MonumentForm />
      </div>
    </div>
  );
}