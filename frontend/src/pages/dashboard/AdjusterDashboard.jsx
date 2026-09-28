import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { claimService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { StatusBadge, RiskBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function AdjusterDashboard() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    claimService.getAll()
      .then((res) => setClaims(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const statusFilters = [
    { value: 'all', label: 'All Claims' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'INVESTIGATION', label: 'Investigation' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'SETTLED', label: 'Settled' },
  ];

  const filtered = claims.filter((c) => {
    const matchesStatus = filter === 'all' || c.status === filter;
    const matchesSearch =
      !search ||
      c.claimNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pending = claims.filter((c) => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)).length;
  const investigation = claims.filter((c) => c.status === 'INVESTIGATION').length;
  const resolved = claims.filter((c) => ['APPROVED', 'REJECTED', 'SETTLED'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Claims Queue</h1>
        <p className="text-sm text-gray-500">Review and manage insurance claims — {user?.name}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: claims.length, icon: AlertCircle, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Review', value: pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Investigation', value: investigation, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
          { label: 'Resolved', value: resolved, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Search by claim number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">Claim No.</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Vehicle</th>
              <th className="table-header">Damage</th>
              <th className="table-header">Risk</th>
              <th className="table-header">Status</th>
              <th className="table-header">Filed</th>
              <th className="table-header">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  No claims match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((claim) => (
                <tr key={claim._id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{claim.claimNumber}</td>
                  <td className="table-cell">{claim.customerId?.name}</td>
                  <td className="table-cell text-gray-500">
                    {claim.policyId?.vehicleMake} {claim.policyId?.vehicleModel}
                  </td>
                  <td className="table-cell font-semibold">{formatCurrency(claim.estimatedDamage)}</td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <RiskBadge level={claim.riskLevel} />
                      <div className="text-xs text-gray-400">Score: {claim.riskScore}</div>
                    </div>
                  </td>
                  <td className="table-cell"><StatusBadge status={claim.status} /></td>
                  <td className="table-cell text-gray-500">{formatDate(claim.createdAt)}</td>
                  <td className="table-cell">
                    <Link
                      to={`/claims/${claim._id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
