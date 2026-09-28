import { getStatusColor, getRiskColor, claimStatusLabel } from '../utils/helpers';

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {claimStatusLabel(status) || status}
    </span>
  );
}

export function RiskBadge({ level }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(level)}`}>
      {level} RISK
    </span>
  );
}

export function PolicyStatusBadge({ status }) {
  const labels = { active: 'Active', expired: 'Expired', cancelled: 'Cancelled', pending: 'Pending' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {labels[status] || status}
    </span>
  );
}
