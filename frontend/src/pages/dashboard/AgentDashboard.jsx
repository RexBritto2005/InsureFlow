import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, FileText, Plus } from 'lucide-react';
import { policyService, quoteService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { PolicyStatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([policyService.getAll(), quoteService.getAll()])
      .then(([p, q]) => {
        setPolicies(p.data.data);
        setQuotes(q.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </div>
        <Link to="/quote" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Quote
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Policies</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{policies.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Active Policies</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{policies.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Quotes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{quotes.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Policies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Policy No.</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Premium</th>
                <th className="table-header">Status</th>
                <th className="table-header">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {policies.slice(0, 10).map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{p.policyNumber}</td>
                  <td className="table-cell">{p.customerId?.name}</td>
                  <td className="table-cell text-gray-500">{p.vehicleMake} {p.vehicleModel}</td>
                  <td className="table-cell font-semibold">{formatCurrency(p.premium)}</td>
                  <td className="table-cell"><PolicyStatusBadge status={p.status} /></td>
                  <td className="table-cell text-gray-500">{formatDate(p.expiryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
