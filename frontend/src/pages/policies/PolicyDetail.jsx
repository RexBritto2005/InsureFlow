import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, AlertCircle, ArrowLeft, Calendar, MapPin, User, Car } from 'lucide-react';
import { policyService } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { PolicyStatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate, coverageLabel } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function PolicyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    policyService.getById(id)
      .then((res) => setPolicy(res.data.data))
      .catch(() => setError('Policy not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (error) return <div className="text-center py-16 text-gray-500">{error}</div>;

  const pb = policy.premiumBreakdown || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/policies" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{policy.policyNumber}</h1>
          <p className="text-sm text-gray-500">{policy.vehicleMake} {policy.vehicleModel} · {policy.vehicleYear}</p>
        </div>
        <PolicyStatusBadge status={policy.status} />
      </div>

      {/* Premium Banner */}
      <div className="bg-blue-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Annual Premium</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(policy.premium)}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">Coverage</p>
            <p className="font-semibold mt-0.5">{coverageLabel(policy.coverageType)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-500 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200 text-xs">Start Date</p>
            <p className="font-medium">{formatDate(policy.startDate)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Expiry Date</p>
            <p className="font-medium">{formatDate(policy.expiryDate)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Vehicle Details" icon={Car}>
          <InfoRow label="Make" value={policy.vehicleMake} />
          <InfoRow label="Model" value={policy.vehicleModel} />
          <InfoRow label="Year" value={policy.vehicleYear} />
          <InfoRow label="Vehicle Value" value={formatCurrency(policy.vehicleValue)} />
          <InfoRow label="Location" value={policy.location} />
        </Section>

        <Section title="Driver & Policy" icon={User}>
          <InfoRow label="Driver Age" value={`${policy.driverAge} years`} />
          <InfoRow label="Previous Claims" value={policy.previousClaims} />
          <InfoRow label="Coverage Type" value={coverageLabel(policy.coverageType)} />
          {policy.customerId && (
            <InfoRow label="Policyholder" value={policy.customerId.name} />
          )}
          {policy.customerId?.email && (
            <InfoRow label="Email" value={policy.customerId.email} />
          )}
        </Section>
      </div>

      {/* Premium Breakdown */}
      {pb.basePremium && (
        <Section title="Premium Breakdown" icon={Shield}>
          <div className="space-y-0">
            <InfoRow label="Base Premium (3% of value)" value={formatCurrency(pb.basePremium)} />
            <InfoRow label="Driver Age Risk" value={formatCurrency(pb.driverRiskAdjustment)} />
            <InfoRow
              label="Claim History"
              value={
                pb.claimHistoryAdjustment < 0
                  ? `− ${formatCurrency(Math.abs(pb.claimHistoryAdjustment))} (NCB)`
                  : formatCurrency(pb.claimHistoryAdjustment)
              }
            />
            <InfoRow label="Vehicle Age" value={formatCurrency(pb.vehicleAgeAdjustment)} />
            <InfoRow label="Coverage" value={formatCurrency(pb.coverageAdjustment)} />
            <InfoRow label="Location Risk" value={formatCurrency(pb.locationRiskAdjustment)} />
            <div className="pt-3 mt-1 border-t-2 border-gray-200 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Total Annual Premium</span>
              <span className="text-base font-bold text-blue-700">{formatCurrency(policy.premium)}</span>
            </div>
          </div>
        </Section>
      )}

      {/* Actions */}
      {user?.role === 'customer' && policy.status === 'active' && (
        <div className="flex gap-3">
          <Link to="/claims/new" state={{ policyId: policy._id }} className="btn-primary flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> Report Accident / File Claim
          </Link>
        </div>
      )}
    </div>
  );
}
