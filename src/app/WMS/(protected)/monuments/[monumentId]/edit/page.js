'use client'

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { dataManager } from '@/lib/data-manager';
import MonumentForm from '@/components/monuments/MonumentForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditMonumentPage() {
  const params = useParams();
  const { monumentId } = params;
  const [monument, setMonument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonument = async () => {
      try {
        const data = await dataManager.getMonumentById(monumentId);
        setMonument(data);
      } catch (error) {
        console.error("Failed to fetch monument for editing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonument();
  }, [monumentId]);

  if (loading) {
    return <div>Loading form...</div>;
  }

  if (!monument) {
    return notFound();
  }

  return (
    <div>
        <Link href={`/WMS/monuments/${monumentId}`} className="inline-flex items-center mb-4 text-sm text-gray-700 hover:text-gray-900">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Monument Details
        </Link>
      <h1 className="mb-6 text-3xl font-bold text-gray-700">Edit Monument</h1>
      <div className="p-6 card">
        {/* Pass the fetched monument data to the form */}
        <MonumentForm monument={monument} />
      </div>
    </div>
  );
}