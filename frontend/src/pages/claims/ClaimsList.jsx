import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Plus, Search } from 'lucide-react';
import { claimService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { StatusBadge, RiskBadge } from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, formatDate, accidentTypeLabel } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function ClaimsList() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    claimService.getAll()
      .then((res) => setClaims(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const filtered = claims.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
    const matchSearch =
      !search ||
      c.claimNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.policyId?.policyNumber?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRisk && matchSearch;
  });

  const statusOptions = ['all', 'SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION', 'APPROVED', 'REJECTED', 'SETTLED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {user?.role === 'customer' ? 'My Claims' : 'Claims Queue'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{claims.length} total claims</p>
        </div>
        {user?.role === 'customer' && (
          <Link to="/claims/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Report Accident
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search by claim number, customer, or policy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-400 self-center mr-1">Status:</span>
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-400 self-center mr-1">Risk:</span>
            {['all', 'LOW', 'MEDIUM', 'HIGH'].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  riskFilter === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No claims found"
          message={user?.role === 'customer' ? 'File a claim if you have had an accident.' : 'No claims match your filters.'}
          icon={AlertCircle}
          action={user?.role === 'customer' && (
            <Link to="/claims/new" className="btn-primary text-sm">Report Accident</Link>
          )}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Claim No.</th>
                <th className="table-header">Policy</th>
                {user?.role !== 'customer' && <th className="table-header">Customer</th>}
                <th className="table-header">Type</th>
                <th className="table-header">Damage</th>
                <th className="table-header">Risk</th>
                <th className="table-header">Status</th>
                <th className="table-header">Filed</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((claim) => (
                <tr key={claim._id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-blue-700">{claim.claimNumber}</td>
                  <td className="table-cell text-gray-500 text-xs">{claim.policyId?.policyNumber}</td>
                  {user?.role !== 'customer' && <td className="table-cell">{claim.customerId?.name}</td>}
                  <td className="table-cell text-gray-600 capitalize">{accidentTypeLabel(claim.accidentType)}</td>
                  <td className="table-cell font-semibold">{formatCurrency(claim.estimatedDamage)}</td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <RiskBadge level={claim.riskLevel} />
                      <div className="text-xs text-gray-400">Score: {claim.riskScore}</div>
                    </div>
                  </td>
                  <td className="table-cell"><StatusBadge status={claim.status} /></td>
                  <td className="table-cell text-gray-400 text-xs">{formatDate(claim.createdAt)}</td>
                  <td className="table-cell">
                    <Link to={`/claims/${claim._id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
