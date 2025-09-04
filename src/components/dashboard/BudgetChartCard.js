'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#EF4444', '#3B82F6']; // Red for Spent, Blue for Remaining

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border rounded-lg shadow-lg">
        <p className="font-semibold">{`${payload[0].name}`}</p>
        <p className="text-sm">{`₹${payload[0].value.toLocaleString('en-IN')}`}</p>
      </div>
    );
  }
  return null;
};

export default function BudgetChartCard({ data, totalBudget }) {
    return (
        <div className="p-6 bg-white border shadow-sm rounded-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">Overall Budget Overview</h3>
            <p className="mb-4 text-2xl font-bold text-gray-900">₹{totalBudget.toLocaleString('en-IN')}</p>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
