import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { adminService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { StatusBadge, RiskBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate, accidentTypeLabel } from '../../utils/helpers';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    adminService.getClaims().then((res) => setClaims(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const filtered = claims.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
    const matchSearch = !search || c.claimNumber.toLowerCase().includes(search.toLowerCase()) || c.customerId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRisk && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">All Claims</h1>
        <p className="text-sm text-gray-500">{claims.length} total claims</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" className="input-field pl-9" placeholder="Search by claim number or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-400 self-center mr-1">Status:</span>
            {['all', 'SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION', 'APPROVED', 'REJECTED', 'SETTLED'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-400 self-center mr-1">Risk:</span>
            {['all', 'LOW', 'MEDIUM', 'HIGH'].map((r) => (
              <button key={r} onClick={() => setRiskFilter(r)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${riskFilter === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">Claim No.</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Policy</th>
              <th className="table-header">Type</th>
              <th className="table-header">Damage</th>
              <th className="table-header">Risk</th>
              <th className="table-header">Status</th>
              <th className="table-header">Filed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="table-cell font-medium text-blue-700">
                  <Link to={`/claims/${c._id}`}>{c.claimNumber}</Link>
                </td>
                <td className="table-cell">{c.customerId?.name}</td>
                <td className="table-cell text-gray-500 text-xs">{c.policyId?.policyNumber}</td>
                <td className="table-cell text-gray-600 capitalize">{accidentTypeLabel(c.accidentType)}</td>
                <td className="table-cell font-semibold">{formatCurrency(c.estimatedDamage)}</td>
                <td className="table-cell"><RiskBadge level={c.riskLevel} /></td>
                <td className="table-cell"><StatusBadge status={c.status} /></td>
                <td className="table-cell text-gray-500">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
