import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { policyService, claimService } from '../../services/api';
import { toast } from '../../components/Toast';
import { formatCurrency } from '../../utils/helpers';

const ACCIDENT_TYPES = [
  { value: 'collision', label: 'Collision' },
  { value: 'theft', label: 'Theft' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'natural_disaster', label: 'Natural Disaster' },
  { value: 'fire', label: 'Fire' },
  { value: 'other', label: 'Other' },
];

export default function NewClaim() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedPolicyId = location.state?.policyId || '';

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const [form, setForm] = useState({
    policyId: preselectedPolicyId,
    accidentDate: '',
    accidentLocation: '',
    accidentType: 'collision',
    description: '',
    estimatedDamage: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    policyService.getAll()
      .then((res) => {
        const active = res.data.data.filter((p) => p.status === 'active');
        setPolicies(active);
        if (preselectedPolicyId) setForm((f) => ({ ...f, policyId: preselectedPolicyId }));
      })
      .finally(() => setLoadingPolicies(false));
  }, [preselectedPolicyId]);

  const validate = () => {
    const e = {};
    if (!form.policyId) e.policyId = 'Select a policy';
    if (!form.accidentDate) e.accidentDate = 'Accident date is required';
    else if (new Date(form.accidentDate) > new Date()) e.accidentDate = 'Date cannot be in the future';
    if (!form.accidentLocation.trim()) e.accidentLocation = 'Location is required';
    if (!form.description.trim() || form.description.length < 20) e.description = 'Provide at least 20 characters description';
    if (!form.estimatedDamage || Number(form.estimatedDamage) <= 0) e.estimatedDamage = 'Enter a valid damage estimate';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await claimService.create({
        ...form,
        estimatedDamage: Number(form.estimatedDamage),
      });
      toast('Claim submitted successfully!', 'success');
      navigate(`/claims/${res.data.data._id}`);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit claim', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedPolicy = policies.find((p) => p._id === form.policyId);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Accident / File Claim</h1>
          <p className="text-sm text-gray-500">FNOL — First Notice of Loss</p>
        </div>
      </div>

      {/* Selected Policy Preview */}
      {selectedPolicy && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-600 mb-1">Filing claim against:</p>
          <p className="font-semibold text-blue-900">{selectedPolicy.vehicleMake} {selectedPolicy.vehicleModel} ({selectedPolicy.vehicleYear})</p>
          <p className="text-xs text-blue-600 mt-0.5">{selectedPolicy.policyNumber} · Premium: {formatCurrency(selectedPolicy.premium)}/yr</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Policy Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Policy <span className="text-red-500">*</span>
            </label>
            {loadingPolicies ? (
              <p className="text-sm text-gray-400">Loading policies...</p>
            ) : policies.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                No active policies found. Purchase a policy first.
              </div>
            ) : (
              <select
                className={`input-field ${errors.policyId ? 'border-red-400' : ''}`}
                value={form.policyId}
                onChange={(e) => setForm({ ...form, policyId: e.target.value })}
              >
                <option value="">— Select a policy —</option>
                {policies.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.policyNumber} — {p.vehicleMake} {p.vehicleModel} ({p.vehicleYear})
                  </option>
                ))}
              </select>
            )}
            {errors.policyId && <p className="text-xs text-red-500 mt-1">{errors.policyId}</p>}
          </div>

          {/* Accident Details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Accident Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accident Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`input-field ${errors.accidentDate ? 'border-red-400' : ''}`}
                  value={form.accidentDate}
                  max={today}
                  onChange={(e) => setForm({ ...form, accidentDate: e.target.value })}
                />
                {errors.accidentDate && <p className="text-xs text-red-500 mt-1">{errors.accidentDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accident Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field"
                  value={form.accidentType}
                  onChange={(e) => setForm({ ...form, accidentType: e.target.value })}
                >
                  {ACCIDENT_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accident Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input-field ${errors.accidentLocation ? 'border-red-400' : ''}`}
              placeholder="e.g. NH-48 near Gurgaon toll"
              value={form.accidentLocation}
              onChange={(e) => setForm({ ...form, accidentLocation: e.target.value })}
            />
            {errors.accidentLocation && <p className="text-xs text-red-500 mt-1">{errors.accidentLocation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
              placeholder="Describe what happened in detail — vehicle positions, road conditions, other parties involved..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-xs text-red-500">{errors.description}</p>
                : <span />}
              <p className="text-xs text-gray-400">{form.description.length} chars</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Damage (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={`input-field ${errors.estimatedDamage ? 'border-red-400' : ''}`}
                placeholder="50000"
                min={1}
                value={form.estimatedDamage}
                onChange={(e) => setForm({ ...form, estimatedDamage: e.target.value })}
              />
              {errors.estimatedDamage && <p className="text-xs text-red-500 mt-1">{errors.estimatedDamage}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Risk Notice */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
            <p className="text-xs text-yellow-800 font-medium mb-1">Fraud & Risk Assessment</p>
            <p className="text-xs text-yellow-700">
              Upon submission, an automated risk assessment will be performed. High-risk claims will be
              automatically flagged for investigation. Providing false information is an offence.
            </p>
          </div>

          <button type="submit" disabled={loading || policies.length === 0} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            {loading ? 'Submitting...' : 'Submit FNOL Claim'}
          </button>
        </form>
      </div>
    </div>
  );
}
