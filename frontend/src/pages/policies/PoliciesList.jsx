import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, Search } from 'lucide-react';
import { policyService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { PolicyStatusBadge } from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, formatDate, coverageLabel } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function PoliciesList() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    policyService.getAll()
      .then((res) => setPolicies(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const filtered = policies.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch =
      !search ||
      p.policyNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.vehicleMake?.toLowerCase().includes(search.toLowerCase()) ||
      p.vehicleModel?.toLowerCase().includes(search.toLowerCase()) ||
      p.customerId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {user?.role === 'customer' ? 'My Policies' : 'All Policies'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{policies.length} total policies</p>
        </div>
        {user?.role === 'customer' && (
          <Link to="/quote" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Policy
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'active', 'expired', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No policies found"
          message={user?.role === 'customer' ? 'Get a quote to purchase your first policy.' : 'No policies match your filters.'}
          icon={Shield}
          action={user?.role === 'customer' && (
            <Link to="/quote" className="btn-primary text-sm">Get a Quote</Link>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((policy) => (
            <Link
              key={policy._id}
              to={`/policies/${policy._id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Shield size={18} className="text-blue-600" />
                </div>
                <PolicyStatusBadge status={policy.status} />
              </div>

              <h3 className="font-semibold text-gray-900">{policy.vehicleMake} {policy.vehicleModel}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{policy.vehicleYear} · {coverageLabel(policy.coverageType)}</p>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Policy No.</span>
                  <span className="font-medium text-gray-700">{policy.policyNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Premium</span>
                  <span className="font-bold text-blue-700">{formatCurrency(policy.premium)}/yr</span>
                </div>
                {user?.role !== 'customer' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-medium text-gray-700">{policy.customerId?.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Expires</span>
                  <span className={`font-medium ${policy.status === 'expired' ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatDate(policy.expiryDate)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
