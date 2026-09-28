import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Search, DollarSign, Clock } from 'lucide-react';
import { claimService } from '../../services/api';
import { toast } from '../../components/Toast';
import { PageLoader } from '../../components/LoadingSpinner';
import { StatusBadge, RiskBadge } from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatCurrency, formatDate, formatDateTime, accidentTypeLabel, getRiskBarColor } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0 gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function ClaimDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [notes, setNotes] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const load = () => {
    claimService.getById(id)
      .then((res) => setClaim(res.data.data))
      .catch(() => toast('Failed to load claim', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status, extra = {}) => {
    setActionLoading(true);
    try {
      const res = await claimService.updateStatus(id, {
        status,
        notes,
        ...extra,
      });
      setClaim(res.data.data);
      toast(`Claim ${status.toLowerCase().replace('_', ' ')} successfully`, 'success');
      setDialog(null);
      setNotes('');
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!claim) return <div className="text-center py-16 text-gray-500">Claim not found.</div>;

  const canAct = ['adjuster', 'admin'].includes(user?.role);
  const policy = claim.policyId;

  const adjusterActions = () => {
    const s = claim.status;
    const actions = [];

    if (['SUBMITTED', 'INVESTIGATION'].includes(s)) {
      actions.push(
        <button key="review" onClick={() => setDialog({ type: 'review' })}
          className="btn-secondary flex items-center gap-2 text-sm">
          <Clock size={15} /> Mark Under Review
        </button>
      );
    }
    if (['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION'].includes(s)) {
      actions.push(
        <button key="approve" onClick={() => setDialog({ type: 'approve' })}
          className="btn-success flex items-center gap-2 text-sm">
          <CheckCircle size={15} /> Approve
        </button>
      );
      actions.push(
        <button key="reject" onClick={() => setDialog({ type: 'reject' })}
          className="btn-danger flex items-center gap-2 text-sm">
          <XCircle size={15} /> Reject
        </button>
      );
    }
    if (['SUBMITTED', 'UNDER_REVIEW'].includes(s)) {
      actions.push(
        <button key="investigate" onClick={() => setDialog({ type: 'investigate' })}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <Search size={15} /> Send for Investigation
        </button>
      );
    }
    if (s === 'APPROVED') {
      actions.push(
        <button key="settle" onClick={() => setDialog({ type: 'settle' })}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <DollarSign size={15} /> Mark as Settled
        </button>
      );
    }
    return actions;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/claims" className="text-gray-400 hover:text-gray-600 mt-1">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{claim.claimNumber}</h1>
            <StatusBadge status={claim.status} />
            <RiskBadge level={claim.riskLevel} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Filed {formatDateTime(claim.createdAt)}
            {claim.adjusterId && ` · Adjuster: ${claim.adjusterId.name}`}
          </p>
        </div>
      </div>

      {/* Adjuster Action Buttons */}
      {canAct && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Adjuster Actions</p>
          <div className="flex flex-wrap gap-2">
            {adjusterActions()}
          </div>
          <div className="mt-3">
            <textarea
              rows={2}
              className="input-field resize-none text-sm"
              placeholder="Add notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Customer</h2>
          <InfoRow label="Name" value={claim.customerId?.name} />
          <InfoRow label="Email" value={claim.customerId?.email} />
          <InfoRow label="Phone" value={claim.customerId?.phone || '—'} />
        </div>

        {/* Policy Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Policy — <Link to={`/policies/${policy?._id}`} className="text-blue-600 hover:underline text-xs">{policy?.policyNumber}</Link>
          </h2>
          <InfoRow label="Vehicle" value={`${policy?.vehicleMake} ${policy?.vehicleModel} (${policy?.vehicleYear})`} />
          <InfoRow label="Vehicle Value" value={formatCurrency(policy?.vehicleValue)} />
          <InfoRow label="Coverage" value={policy?.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party'} />
          <InfoRow label="Premium" value={formatCurrency(policy?.premium)} />
          <InfoRow label="Status" value={<span className="capitalize">{policy?.status}</span>} />
        </div>
      </div>

      {/* Accident Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Accident Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Accident Date" value={formatDate(claim.accidentDate)} />
            <InfoRow label="Accident Type" value={accidentTypeLabel(claim.accidentType)} />
            <InfoRow label="Location" value={claim.accidentLocation} />
          </div>
          <div>
            <InfoRow label="Estimated Damage" value={formatCurrency(claim.estimatedDamage)} />
            {claim.settlementAmount && (
              <InfoRow label="Settlement Amount" value={formatCurrency(claim.settlementAmount)} />
            )}
            {claim.rejectionReason && (
              <InfoRow label="Rejection Reason" value={claim.rejectionReason} />
            )}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed">{claim.description}</p>
        </div>
        {claim.imageUrl && (
          <div className="mt-3">
            <img src={claim.imageUrl} alt="Accident" className="rounded-lg max-h-48 object-cover border" />
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className={claim.riskLevel === 'HIGH' ? 'text-red-500' : claim.riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'} />
          <h2 className="text-sm font-semibold text-gray-900">Risk & Fraud Assessment</h2>
          <span className="text-xs text-gray-400">(Automated — Gosu-style rule engine)</span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Risk Score</span>
              <span className={`text-sm font-bold ${claim.riskLevel === 'HIGH' ? 'text-red-600' : claim.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                {claim.riskScore} / 100
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getRiskBarColor(claim.riskLevel)}`}
                style={{ width: `${claim.riskScore}%` }}
              />
            </div>
          </div>
          <RiskBadge level={claim.riskLevel} />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Risk Factors Identified</p>
          <ul className="space-y-1.5">
            {claim.riskFactors?.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${claim.riskLevel === 'HIGH' ? 'bg-red-500' : claim.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="text-gray-700">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {claim.adjusterNotes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Adjuster Notes</p>
            <p className="text-sm text-gray-700">{claim.adjusterNotes}</p>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Status Timeline</h2>
        <div className="space-y-3">
          {claim.statusHistory?.map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                {i < claim.statusHistory.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
              </div>
              <div className="pb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={h.status} />
                  {h.changedBy?.name && (
                    <span className="text-xs text-gray-400">by {h.changedBy.name}</span>
                  )}
                </div>
                {h.notes && <p className="text-xs text-gray-500 mt-1">{h.notes}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(h.changedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={dialog?.type === 'review'}
        title="Mark as Under Review"
        message="Move this claim to 'Under Review' status?"
        confirmText="Yes, Mark Under Review"
        variant="info"
        onConfirm={() => updateStatus('UNDER_REVIEW')}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === 'approve'}
        title="Approve Claim"
        message="Are you sure you want to approve this claim? This will allow settlement."
        confirmText="Approve Claim"
        variant="info"
        onConfirm={() => updateStatus('APPROVED')}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === 'reject'}
        title="Reject Claim"
        message="Reject this claim? Please ensure you have added a reason in the notes."
        confirmText="Reject Claim"
        variant="danger"
        onConfirm={() => updateStatus('REJECTED', { rejectionReason: notes })}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === 'investigate'}
        title="Send for Investigation"
        message="Flag this claim for investigation. It will be reviewed by the investigations team."
        confirmText="Send for Investigation"
        variant="danger"
        onConfirm={() => updateStatus('INVESTIGATION')}
        onCancel={() => setDialog(null)}
      />

      {/* Settle Dialog (needs amount input) */}
      {dialog?.type === 'settle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Mark as Settled</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder={claim.estimatedDamage}
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Estimated damage: {formatCurrency(claim.estimatedDamage)}</p>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button onClick={() => setDialog(null)} className="btn-secondary text-sm">Cancel</button>
              <button
                disabled={actionLoading || !settlementAmount}
                onClick={() => updateStatus('SETTLED', { settlementAmount: Number(settlementAmount) })}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
