export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const map = {
    // Policy statuses
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    // Claim statuses
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    INVESTIGATION: 'bg-orange-100 text-orange-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    SETTLED: 'bg-purple-100 text-purple-800',
    // Payment statuses
    SUCCESS: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REFUNDED: 'bg-blue-100 text-blue-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const getRiskColor = (level) => {
  const map = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  };
  return map[level] || 'bg-gray-100 text-gray-700';
};

export const getRiskBarColor = (level) => {
  const map = { LOW: 'bg-green-500', MEDIUM: 'bg-yellow-500', HIGH: 'bg-red-500' };
  return map[level] || 'bg-gray-400';
};

export const coverageLabel = (type) => {
  const map = { comprehensive: 'Comprehensive', third_party: 'Third Party' };
  return map[type] || type;
};

export const accidentTypeLabel = (type) => {
  const map = {
    collision: 'Collision',
    theft: 'Theft',
    vandalism: 'Vandalism',
    natural_disaster: 'Natural Disaster',
    fire: 'Fire',
    other: 'Other',
  };
  return map[type] || type;
};

export const claimStatusLabel = (status) => {
  const map = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    INVESTIGATION: 'Investigation',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SETTLED: 'Settled',
  };
  return map[status] || status;
};
