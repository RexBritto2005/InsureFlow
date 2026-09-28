import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { quoteService, policyService } from '../../services/api';
import { toast } from '../../components/Toast';
import { formatCurrency } from '../../utils/helpers';

const LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Other'];
const CURRENT_YEAR = new Date().getFullYear();

function BreakdownRow({ label, amount, note, highlight }) {
  const isNegative = amount < 0;
  return (
    <div className={`flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0 ${highlight ? 'font-semibold' : ''}`}>
      <div>
        <p className={`text-sm ${highlight ? 'text-gray-900' : 'text-gray-700'}`}>{label}</p>
        {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
      </div>
      <span className={`text-sm font-medium ml-4 shrink-0 ${isNegative ? 'text-green-600' : highlight ? 'text-blue-700 text-base' : 'text-gray-700'}`}>
        {isNegative ? `− ${formatCurrency(Math.abs(amount))}` : `+ ${formatCurrency(amount)}`}
      </span>
    </div>
  );
}

export default function QuotePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=result
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);
  const [breakdown, setBreakdown] = useState(null);

  const [form, setForm] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: CURRENT_YEAR,
    vehicleValue: '',
    driverAge: '',
    previousClaims: '0',
    location: 'Mumbai',
    coverageType: 'comprehensive',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.vehicleMake.trim()) e.vehicleMake = 'Vehicle make is required';
    if (!form.vehicleModel.trim()) e.vehicleModel = 'Vehicle model is required';
    if (form.vehicleYear < 1980 || form.vehicleYear > CURRENT_YEAR + 1) e.vehicleYear = 'Enter a valid year';
    if (!form.vehicleValue || Number(form.vehicleValue) <= 0) e.vehicleValue = 'Enter a valid vehicle value';
    if (!form.driverAge || Number(form.driverAge) < 18 || Number(form.driverAge) > 100) e.driverAge = 'Age must be 18–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        vehicleYear: Number(form.vehicleYear),
        vehicleValue: Number(form.vehicleValue),
        driverAge: Number(form.driverAge),
        previousClaims: Number(form.previousClaims),
      };
      const res = await quoteService.create(payload);
      setQuoteResult(res.data.data.quote);
      setBreakdown(res.data.data.breakdown);
      setStep(2);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to calculate quote', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await policyService.create({
        quoteId: quoteResult._id,
        vehicleMake: quoteResult.vehicleMake,
        vehicleModel: quoteResult.vehicleModel,
        vehicleYear: quoteResult.vehicleYear,
        vehicleValue: quoteResult.vehicleValue,
        driverAge: quoteResult.driverAge,
        previousClaims: quoteResult.previousClaims,
        location: quoteResult.location,
        coverageType: quoteResult.coverageType,
        paymentMethod: 'net_banking',
      });
      toast('Policy purchased successfully!', 'success');
      navigate('/policies');
    } catch (err) {
      toast(err.response?.data?.message || 'Purchase failed', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const field = (key, label, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        className={`input-field ${errors[key] ? 'border-red-400' : ''}`}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...extra}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  if (step === 2 && quoteResult && breakdown) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quote Generated</h1>
            <p className="text-sm text-gray-500">{quoteResult.quoteNumber} · Valid for 30 days</p>
          </div>
        </div>

        {/* Vehicle Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Vehicle & Coverage</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{quoteResult.vehicleMake} {quoteResult.vehicleModel} ({quoteResult.vehicleYear})</span></div>
            <div><span className="text-gray-500">Value:</span> <span className="font-medium">{formatCurrency(quoteResult.vehicleValue)}</span></div>
            <div><span className="text-gray-500">Driver Age:</span> <span className="font-medium">{quoteResult.driverAge} years</span></div>
            <div><span className="text-gray-500">Location:</span> <span className="font-medium">{quoteResult.location}</span></div>
            <div><span className="text-gray-500">Coverage:</span> <span className="font-medium capitalize">{quoteResult.coverageType.replace('_', ' ')}</span></div>
            <div><span className="text-gray-500">Previous Claims:</span> <span className="font-medium">{quoteResult.previousClaims}</span></div>
          </div>
        </div>

        {/* Premium Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Premium Breakdown</h2>
          </div>

          <BreakdownRow label="Base Premium (3% of vehicle value)" amount={breakdown.basePremium} />
          <BreakdownRow
            label="Driver Age Risk"
            amount={breakdown.driverRisk.amount}
            note={breakdown.driverRisk.reason}
          />
          <BreakdownRow
            label="Claim History"
            amount={breakdown.claimHistory.amount}
            note={breakdown.claimHistory.reason}
          />
          <BreakdownRow
            label="Vehicle Age"
            amount={breakdown.vehicleAge.amount}
            note={breakdown.vehicleAge.reason}
          />
          <BreakdownRow
            label="Coverage Type"
            amount={breakdown.coverage.amount}
            note={breakdown.coverage.reason}
          />
          <BreakdownRow
            label="Location Risk"
            amount={breakdown.locationRisk.amount}
            note={breakdown.locationRisk.reason}
          />

          <div className="mt-4 pt-3 border-t-2 border-gray-200 flex items-center justify-between">
            <p className="text-base font-semibold text-gray-900">Annual Premium</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(quoteResult.finalPremium)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="btn-secondary flex-1"
          >
            Modify Quote
          </button>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {purchasing ? 'Processing...' : (
              <>Purchase Policy <ArrowRight size={16} /></>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          By purchasing, you agree to the policy terms. Payment will be processed via net banking (mock).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Calculator size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Get a Quote</h1>
          <p className="text-sm text-gray-500">Calculate your motor insurance premium instantly</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleCalculate} className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Vehicle Details</p>
            <div className="grid grid-cols-2 gap-4">
              {field('vehicleMake', 'Make', 'text', { placeholder: 'e.g. Maruti' })}
              {field('vehicleModel', 'Model', 'text', { placeholder: 'e.g. Swift' })}
              {field('vehicleYear', 'Year', 'number', { min: 1980, max: CURRENT_YEAR + 1, placeholder: CURRENT_YEAR })}
              {field('vehicleValue', 'Vehicle Value (₹)', 'number', { min: 1, placeholder: '650000' })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Driver Details</p>
            <div className="grid grid-cols-2 gap-4">
              {field('driverAge', 'Driver Age', 'number', { min: 18, max: 100, placeholder: '30' })}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Claims</label>
                <select
                  className="input-field"
                  value={form.previousClaims}
                  onChange={(e) => setForm({ ...form, previousClaims: e.target.value })}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 0 ? '(No Claim Bonus)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Coverage & Location</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                <select
                  className="input-field"
                  value={form.coverageType}
                  onChange={(e) => setForm({ ...form, coverageType: e.target.value })}
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="third_party">Third Party</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  className="input-field"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            <Calculator size={18} />
            {loading ? 'Calculating...' : 'Calculate Premium'}
          </button>
        </form>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">How premium is calculated</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Base: 3% of vehicle value</li>
          <li>Driver age risk loading (higher for under-25)</li>
          <li>No-claim bonus for zero previous claims</li>
          <li>Additional loading for vehicles older than 8 years</li>
          <li>Coverage and location risk factors</li>
        </ul>
      </div>
    </div>
  );
}
