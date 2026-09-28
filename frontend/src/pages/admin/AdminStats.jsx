import { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';

const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };
const STATUS_COLORS = {
  SUBMITTED: '#3b82f6', UNDER_REVIEW: '#f59e0b', INVESTIGATION: '#f97316',
  APPROVED: '#10b981', REJECTED: '#ef4444', SETTLED: '#8b5cf6',
};

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { summary, claimsByStatus, riskDistribution } = data;

  const claimData = Object.entries(claimsByStatus).map(([name, count]) => ({ name, count }));
  const riskData = Object.entries(riskDistribution).map(([name, value]) => ({ name, value }));

  const resolvedRate = summary.totalClaims > 0
    ? Math.round(((summary.approvedClaims + summary.rejectedClaims + summary.settledClaims) / summary.totalClaims) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Statistics & Analytics</h1>
        <p className="text-sm text-gray-500">InsureFlow platform metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Premium', value: formatCurrency(summary.totalPremiumCollected), sub: 'Collected' },
          { label: 'Resolution Rate', value: `${resolvedRate}%`, sub: 'Claims resolved' },
          { label: 'High Risk Claims', value: summary.highRiskClaims, sub: 'Require attention' },
          { label: 'Active Policies', value: summary.activePolicies, sub: `of ${summary.totalPolicies} total` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Claims Status Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={claimData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {claimData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Risk Level Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {riskData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Customers', value: summary.totalCustomers },
            { label: 'Total Policies', value: summary.totalPolicies },
            { label: 'Active Policies', value: summary.activePolicies },
            { label: 'Total Claims', value: summary.totalClaims },
            { label: 'Submitted', value: claimsByStatus.SUBMITTED },
            { label: 'Under Review', value: claimsByStatus.UNDER_REVIEW },
            { label: 'Investigation', value: claimsByStatus.INVESTIGATION },
            { label: 'Approved', value: claimsByStatus.APPROVED },
            { label: 'Rejected', value: claimsByStatus.REJECTED },
            { label: 'Settled', value: claimsByStatus.SETTLED },
            { label: 'LOW Risk', value: riskDistribution.LOW },
            { label: 'HIGH Risk', value: riskDistribution.HIGH },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
