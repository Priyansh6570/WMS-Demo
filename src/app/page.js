import Link from 'next/link'
import { Building2, Users, FileText, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Directorate of Archaeology
                </h1>
                <p className="text-sm text-gray-500">Madhya Pradesh</p>
              </div>
            </div>
            
            <Link 
              href="/WMS/login"
              className="btn btn-primary"
            >
              WMS Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Heritage Preservation</span>
            <span className="block text-primary-600">Made Digital</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600">
            Streamlining monument restoration workflows through smart technology. 
            Manage projects, track progress, and preserve our heritage with transparency and efficiency.
          </p>
          
          <div className="mt-10 flex justify-center">
            <Link 
              href="/WMS/login"
              className="btn-primary btn-lg text-lg px-8"
            >
              Access WMS Portal
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card text-center p-6">
            <div className="flex justify-center">
              <Building2 className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Monument Management
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Comprehensive database of 490+ monuments with detailed records and restoration history.
            </p>
          </div>

          <div className="card text-center p-6">
            <div className="flex justify-center">
              <FileText className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Project Tracking
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Real-time project monitoring with milestone-based progress tracking and documentation.
            </p>
          </div>

          <div className="card text-center p-6">
            <div className="flex justify-center">
              <Users className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Team Collaboration
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Multi-role access with contractors, quality managers, and financial officers.
            </p>
          </div>

          <div className="card text-center p-6">
            <div className="flex justify-center">
              <Calendar className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Smart Analytics
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Advanced reporting and analytics for informed decision making and performance tracking.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Heritage Preservation Impact
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">490+</div>
              <div className="text-sm text-gray-600 mt-1">Monuments Protected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600 mt-1">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-sm text-gray-600 mt-1">Skilled Contractors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">₹50Cr+</div>
              <div className="text-sm text-gray-600 mt-1">Investment Tracked</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 Directorate of Archaeology, Madhya Pradesh. All rights reserved.</p>
            <p className="mt-1">Digitizing Heritage Preservation Through Smart Workflow Management</p>
          </div>
        </div>
      </footer>
    </div>
  )
}