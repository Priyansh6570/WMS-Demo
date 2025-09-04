'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import StatCard from '@/components/dashboard/StatCard';
import ProjectSummaryCard from '@/components/dashboard/ProjectSummaryCard';
import AlertsCard from '@/components/dashboard/AlertsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import BudgetChartCard from '@/components/dashboard/BudgetChartCard';
import Loading from '@/components/ui/Loading';
import { Users, Building, FolderOpen, AlertTriangle } from 'lucide-react';

const AdminDashboard = ({ stats, loading }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Building} title="Total Monuments" value={stats?.totalMonuments} isLoading={loading} color="purple" />
            <StatCard icon={FolderOpen} title="Active Projects" value={stats?.activeProjectsCount} isLoading={loading} color="green" />
            <StatCard icon={AlertTriangle} title="Overdue Projects" value={stats?.overdueProjectsCount} isLoading={loading} color="red" />
            <StatCard icon={Users} title="Total Users" value={stats?.totalUsers} isLoading={loading} color="blue" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Active Projects</h2>
                {loading ? <Loading/> : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {stats?.activeProjectsList?.length > 0 ? (
                             stats.activeProjectsList.map(project => (
                                <ProjectSummaryCard key={project.id} project={project} />
                            ))
                        ) : (
                           <div className="md:col-span-2 p-8 text-center border-2 border-dashed rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900">No Active Projects</h4>
                                <p className="mt-1 text-sm text-gray-500">All projects are either scheduled or completed.</p>
                           </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <BudgetChartCard data={stats?.budgetBreakdownData || []} totalBudget={stats?.totalBudget || 0}/>
                <AlertsCard title="Upcoming Projects" items={stats?.upcomingProjectsList} linkBase="/WMS/projects" alertType="upcoming" />
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <AlertsCard title="Overdue Projects" items={stats?.overdueProjectsList} linkBase="/WMS/projects" alertType="overdue" />
            </div>
             <ActivityFeed activities={stats?.recentActivity || []} />
        </div>
    </div>
);

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const statsData = await dataManager.getDashboardStats();
                setStats(statsData);
            } catch (err) {
                setError('Could not load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const renderDashboardByRole = () => {
        if (loading) return <Loading />;
        
        switch (user?.role) {
            case 'super_admin':
            case 'admin':
                return <AdminDashboard stats={stats} loading={loading} />;
            default:
                return <p>Dashboard coming soon for your role.</p>;
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-gray-600">Welcome back, {user?.name}! Here's an overview of your projects.</p>
            </header>
            {error ? <div className="p-4 text-red-600 bg-red-100 rounded-md">{error}</div> : renderDashboardByRole()}
        </div>
    );
}