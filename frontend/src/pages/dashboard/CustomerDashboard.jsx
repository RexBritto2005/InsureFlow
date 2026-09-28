import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle, CreditCard, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { policyService, claimService, paymentService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { StatusBadge, PolicyStatusBadge, RiskBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
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

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      policyService.getAll(),
      claimService.getAll(),
      paymentService.getAll(),
    ])
      .then(([p, c, pay]) => {
        setPolicies(p.data.data);
        setClaims(c.data.data);
        setPayments(pay.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const activePolicies = policies.filter((p) => p.status === 'active');
  const openClaims = claims.filter((c) => ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION'].includes(c.status));
  const premiumDue = activePolicies.reduce((sum, p) => sum + p.premium, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s a summary of your insurance portfolio</p>
        </div>
        <Link to="/quote" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Quote
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Policies" value={activePolicies.length} subtitle={`${policies.length} total`} icon={Shield} color="blue" />
        <StatCard title="Open Claims" value={openClaims.length} subtitle={`${claims.length} total`} icon={AlertCircle} color="orange" />
        <StatCard title="Annual Premium" value={formatCurrency(premiumDue)} subtitle="Total across policies" icon={CreditCard} color="green" />
        <StatCard title="Total Claims" value={claims.length} subtitle="All time" icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policies */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Active Policies</h2>
            <Link to="/policies" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {activePolicies.length === 0 ? (
            <div className="p-8 text-center">
              <Shield size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No active policies.</p>
              <Link to="/quote" className="text-blue-600 text-xs hover:underline mt-1 inline-block">Get your first quote →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activePolicies.slice(0, 4).map((policy) => (
                <Link key={policy._id} to={`/policies/${policy._id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{policy.vehicleMake} {policy.vehicleModel}</p>
                    <p className="text-xs text-gray-400">{policy.policyNumber} · Expires {formatDate(policy.expiryDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(policy.premium)}</p>
                    <PolicyStatusBadge status={policy.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Claims</h2>
            <Link to="/claims" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {claims.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No claims filed.</p>
              <Link to="/claims/new" className="text-blue-600 text-xs hover:underline mt-1 inline-block">Report an accident →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {claims.slice(0, 4).map((claim) => (
                <Link key={claim._id} to={`/claims/${claim._id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                    <AlertCircle size={16} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{claim.claimNumber}</p>
                    <p className="text-xs text-gray-400">{formatDate(claim.accidentDate)} · {formatCurrency(claim.estimatedDamage)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={claim.status} />
                    <RiskBadge level={claim.riskLevel} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Payments</h2>
          <Link to="/payments" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No payment records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Payment No.</th>
                  <th className="table-header">Policy</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.slice(0, 5).map((pay) => (
                  <tr key={pay._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{pay.paymentNumber}</td>
                    <td className="table-cell text-gray-500">{pay.policyId?.policyNumber}</td>
                    <td className="table-cell font-semibold text-green-700">{formatCurrency(pay.amount)}</td>
                    <td className="table-cell capitalize">{pay.paymentMethod?.replace('_', ' ')}</td>
                    <td className="table-cell text-gray-500">{formatDate(pay.transactionDate)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        pay.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{pay.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
