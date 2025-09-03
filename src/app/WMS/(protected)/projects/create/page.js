import { Suspense } from 'react';
import CreateProjectForm from '@/components/monuments/CreateProjectForm';

function CreateProjectPageContent() {
  return <CreateProjectForm />;
}

export default function CreateProjectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p>Loading create project form...</p>
        </div>
      </div>
    }>
      <CreateProjectPageContent />
    </Suspense>
  );
}