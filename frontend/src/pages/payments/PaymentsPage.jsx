import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getAll()
      .then((res) => setPayments(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const total = payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);

  const methodLabel = (m) => {
    const map = { credit_card: 'Credit Card', debit_card: 'Debit Card', net_banking: 'Net Banking', upi: 'UPI', wallet: 'Wallet' };
    return map[m] || m;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payment History</h1>
        <p className="text-sm text-gray-500 mt-0.5">{payments.length} transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{payments.filter((p) => p.status === 'SUCCESS').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" icon={CreditCard} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Payment No.</th>
                <th className="table-header">Policy</th>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Method</th>
                <th className="table-header">Date</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((pay) => (
                <tr key={pay._id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{pay.paymentNumber}</td>
                  <td className="table-cell text-gray-500 text-xs">{pay.policyId?.policyNumber}</td>
                  <td className="table-cell text-gray-600 text-xs max-w-xs truncate">{pay.description}</td>
                  <td className="table-cell font-bold text-green-700">{formatCurrency(pay.amount)}</td>
                  <td className="table-cell text-gray-600">{methodLabel(pay.paymentMethod)}</td>
                  <td className="table-cell text-gray-500 text-xs">{formatDateTime(pay.transactionDate)}</td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pay.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-800'
                        : pay.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pay.status}
                    </span>
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
