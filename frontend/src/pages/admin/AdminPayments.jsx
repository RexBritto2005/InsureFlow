import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPayments().then((res) => setPayments(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const total = payments.filter((p) => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);

  const methodLabel = (m) => ({ credit_card: 'Credit Card', debit_card: 'Debit Card', net_banking: 'Net Banking', upi: 'UPI', wallet: 'Wallet' }[m] || m);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">All Payments</h1>
        <p className="text-sm text-gray-500">{payments.length} transactions · Total collected: {formatCurrency(total)}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{payments.filter((p) => p.status === 'SUCCESS').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">Payment No.</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Policy</th>
              <th className="table-header">Amount</th>
              <th className="table-header">Method</th>
              <th className="table-header">Date</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{p.paymentNumber}</td>
                <td className="table-cell">{p.customerId?.name}</td>
                <td className="table-cell text-gray-500 text-xs">{p.policyId?.policyNumber}</td>
                <td className="table-cell font-bold text-green-700">{formatCurrency(p.amount)}</td>
                <td className="table-cell text-gray-600">{methodLabel(p.paymentMethod)}</td>
                <td className="table-cell text-gray-500 text-xs">{formatDateTime(p.transactionDate)}</td>
                <td className="table-cell">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
