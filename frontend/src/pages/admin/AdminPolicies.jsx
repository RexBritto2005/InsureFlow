import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { adminService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { PolicyStatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate, coverageLabel } from '../../utils/helpers';

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    adminService.getPolicies().then((res) => setPolicies(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const filtered = policies.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = !search || p.policyNumber.toLowerCase().includes(search.toLowerCase()) || p.customerId?.name?.toLowerCase().includes(search.toLowerCase()) || p.vehicleMake.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">All Policies</h1>
        <p className="text-sm text-gray-500">{policies.length} total policies</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" className="input-field pl-9" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {['all', 'active', 'expired', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">Policy No.</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Vehicle</th>
              <th className="table-header">Coverage</th>
              <th className="table-header">Premium</th>
              <th className="table-header">Start</th>
              <th className="table-header">Expiry</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="table-cell font-medium text-blue-700">
                  <Link to={`/policies/${p._id}`}>{p.policyNumber}</Link>
                </td>
                <td className="table-cell">{p.customerId?.name}</td>
                <td className="table-cell text-gray-600">{p.vehicleMake} {p.vehicleModel} ({p.vehicleYear})</td>
                <td className="table-cell text-gray-600">{coverageLabel(p.coverageType)}</td>
                <td className="table-cell font-semibold">{formatCurrency(p.premium)}</td>
                <td className="table-cell text-gray-500">{formatDate(p.startDate)}</td>
                <td className="table-cell text-gray-500">{formatDate(p.expiryDate)}</td>
                <td className="table-cell"><PolicyStatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
