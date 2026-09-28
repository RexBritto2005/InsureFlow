import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, Shield, AlertCircle, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { StatusBadge, RiskBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

const CLAIM_COLORS = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  INVESTIGATION: '#f97316',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  SETTLED: '#8b5cf6',
};

const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <p className="text-gray-500">Failed to load dashboard.</p>;

  const { summary, claimsByStatus, riskDistribution, recentClaims, highRiskClaims } = data;

  const claimChartData = Object.entries(claimsByStatus).map(([name, count]) => ({ name, count }));
  const riskChartData = Object.entries(riskDistribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">InsureFlow enterprise overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={summary.totalCustomers} icon={Users} color="blue" />
        <StatCard title="Total Policies" value={summary.totalPolicies} subtitle={`${summary.activePolicies} active`} icon={Shield} color="green" />
        <StatCard title="Total Claims" value={summary.totalClaims} subtitle={`${summary.pendingClaims} pending`} icon={AlertCircle} color="orange" />
        <StatCard title="Premium Collected" value={formatCurrency(summary.totalPremiumCollected)} icon={CreditCard} color="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Approved Claims" value={summary.approvedClaims} icon={TrendingUp} color="green" />
        <StatCard title="Rejected Claims" value={summary.rejectedClaims} icon={AlertCircle} color="red" />
        <StatCard title="Investigation" value={summary.investigationClaims} icon={AlertTriangle} color="yellow" />
        <StatCard title="High Risk Claims" value={summary.highRiskClaims} icon={AlertTriangle} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Claims by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={claimChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {claimChartData.map((entry) => (
                  <Cell key={entry.name} fill={CLAIM_COLORS[entry.name] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {riskChartData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High Risk Claims */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            High Risk Claims
          </h2>
          <Link to="/admin/claims" className="text-xs text-blue-600 hover:underline">View all claims</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Claim No.</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Damage</th>
                <th className="table-header">Risk Score</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {highRiskClaims.map((claim) => (
                <tr key={claim._id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-blue-700">
                    <Link to={`/claims/${claim._id}`}>{claim.claimNumber}</Link>
                  </td>
                  <td className="table-cell">{claim.customerId?.name}</td>
                  <td className="table-cell text-gray-500">{claim.policyId?.vehicleMake} {claim.policyId?.vehicleModel}</td>
                  <td className="table-cell font-semibold">{formatCurrency(claim.estimatedDamage)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${claim.riskScore}%` }} />
                      </div>
                      <span className="text-xs font-medium text-red-600">{claim.riskScore}</span>
                    </div>
                  </td>
                  <td className="table-cell"><StatusBadge status={claim.status} /></td>
                  <td className="table-cell text-gray-500">{formatDate(claim.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Claims</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Claim No.</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Policy</th>
                <th className="table-header">Damage</th>
                <th className="table-header">Risk</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentClaims.map((claim) => (
                <tr key={claim._id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-blue-700">
                    <Link to={`/claims/${claim._id}`}>{claim.claimNumber}</Link>
                  </td>
                  <td className="table-cell">{claim.customerId?.name}</td>
                  <td className="table-cell text-gray-500">{claim.policyId?.policyNumber}</td>
                  <td className="table-cell font-semibold">{formatCurrency(claim.estimatedDamage)}</td>
                  <td className="table-cell"><RiskBadge level={claim.riskLevel} /></td>
                  <td className="table-cell"><StatusBadge status={claim.status} /></td>
                  <td className="table-cell text-gray-500">{formatDate(claim.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
