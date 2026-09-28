import { Shield, AlertCircle, CreditCard, Code2, Cloud, Info } from 'lucide-react';

const mappings = [
  {
    icon: Shield,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    headerColor: 'bg-blue-600',
    gwComponent: 'PolicyCenter',
    insureflowComponent: 'Policy Module',
    description: 'Manages the complete policy lifecycle — from quote generation to policy issuance, renewals, endorsements and cancellations.',
    gwFeatures: [
      'Quote workflow with underwriting rules',
      'Policy issuance and lifecycle management',
      'Endorsement and cancellation workflows',
      'Coverage configuration',
      'Policy search and retrieval',
    ],
    insureflowFeatures: [
      'Premium calculation engine (premiumEngine.js)',
      'Quote generation with transparent breakdown',
      'Policy creation from quote',
      'Policy status management (active/expired/cancelled)',
      'Policy detail view with full breakdown',
    ],
  },
  {
    icon: AlertCircle,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    headerColor: 'bg-orange-500',
    gwComponent: 'ClaimCenter',
    insureflowComponent: 'Claims Module',
    description: 'Handles the full claim lifecycle — FNOL intake, exposure management, investigation, adjudication and settlement.',
    gwFeatures: [
      'FNOL (First Notice of Loss) intake',
      'Claim assignment and routing',
      'Exposure and coverage evaluation',
      'Investigation workflow',
      'Settlement and payment processing',
    ],
    insureflowFeatures: [
      'FNOL submission form',
      'Automated risk/fraud scoring (fraudEngine.js)',
      'Claim status workflow (SUBMITTED → SETTLED)',
      'Adjuster review, approve, reject, investigate',
      'Settlement amount recording',
      'Status timeline tracking',
    ],
  },
  {
    icon: CreditCard,
    color: 'bg-green-50 text-green-600 border-green-100',
    headerColor: 'bg-green-600',
    gwComponent: 'BillingCenter',
    insureflowComponent: 'Billing Module',
    description: 'Manages premium billing, invoice generation, payment collection, and billing account management.',
    gwFeatures: [
      'Invoice generation and scheduling',
      'Payment plan management',
      'Premium collection workflows',
      'Delinquency management',
      'Billing account management',
    ],
    insureflowFeatures: [
      'Premium payment recording on policy purchase',
      'Payment history tracking',
      'Mock payment processing (net_banking/UPI/card)',
      'Payment status tracking (SUCCESS/FAILED)',
      'Admin payment overview',
    ],
  },
  {
    icon: Code2,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    headerColor: 'bg-purple-600',
    gwComponent: 'Gosu Language',
    insureflowComponent: 'Business Rule Services',
    description: 'Gosu is Guidewire\'s proprietary language for business rules, validations, calculations and insurance-specific logic.',
    gwFeatures: [
      'Strongly-typed business rule language',
      'Integrated with Guidewire entity model',
      'PCF UI components with Gosu backing code',
      'Rule sets and decision tables',
      'Premium and underwriting calculations',
    ],
    insureflowFeatures: [
      'premiumEngine.js — premium calculation rules',
      'fraudEngine.js — risk scoring rules',
      'Deterministic rule-based logic (no ML)',
      'Separated from controllers (single responsibility)',
      'Transparent breakdown returned to UI',
    ],
  },
  {
    icon: Cloud,
    color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    headerColor: 'bg-cyan-600',
    gwComponent: 'Cloud API (REST)',
    insureflowComponent: 'InsureFlow REST API',
    description: 'Guidewire Cloud provides REST APIs for external system integration and modern SaaS delivery.',
    gwFeatures: [
      'REST API for external integrations',
      'OAuth 2.0 authentication',
      'Versioned API endpoints',
      'Webhook notifications',
      'API gateway and rate limiting',
    ],
    insureflowFeatures: [
      'Express.js REST API',
      'JWT authentication',
      'Role-based access control middleware',
      'Consistent JSON response format',
      'Centralized error handling',
    ],
  },
];

function FlowArrow() {
  return (
    <div className="flex justify-center my-2">
      <div className="w-0.5 h-6 bg-gray-300" />
    </div>
  );
}

export default function GuidewirePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guidewire InsuranceSuite Mapping</h1>
        <p className="text-sm text-gray-500 mt-1">Architecture concept mapping for academic reference</p>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Academic Reference — Not an actual Guidewire implementation</p>
          <p className="text-sm text-amber-700 mt-1">
            InsureFlow is an <strong>independent full-stack insurance platform</strong> built with React, Node.js,
            Express, and MongoDB. It is <strong>inspired by Guidewire InsuranceSuite concepts</strong> and demonstrates
            understanding of insurance domain workflows. InsureFlow is not affiliated with, endorsed by, or built on
            Guidewire Software. All Guidewire product names are trademarks of Guidewire Software, Inc.
          </p>
        </div>
      </div>

      {/* Architecture Flow */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-6">InsureFlow Architecture — Guidewire Concept Mapping</h2>
        <div className="flex flex-col items-center">
          {[
            { label: 'Customer Portal', sub: 'React + Vite frontend', color: 'bg-gray-100 border-gray-300 text-gray-800' },
            { label: 'REST API Layer', sub: 'Express.js → Cloud API concept', color: 'bg-cyan-50 border-cyan-300 text-cyan-800' },
            { label: 'Policy Module', sub: 'PolicyCenter concept', color: 'bg-blue-50 border-blue-300 text-blue-800' },
            { label: 'Claims Module', sub: 'ClaimCenter concept', color: 'bg-orange-50 border-orange-300 text-orange-800' },
            { label: 'Billing Module', sub: 'BillingCenter concept', color: 'bg-green-50 border-green-300 text-green-800' },
            { label: 'Business Rules (premiumEngine + fraudEngine)', sub: 'Gosu language concept', color: 'bg-purple-50 border-purple-300 text-purple-800' },
            { label: 'MongoDB Atlas', sub: 'Data persistence layer', color: 'bg-gray-100 border-gray-300 text-gray-800' },
          ].map((item, i, arr) => (
            <div key={item.label} className="w-full max-w-lg">
              <div className={`border-2 rounded-xl px-5 py-3 text-center ${item.color}`}>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{item.sub}</p>
              </div>
              {i < arr.length - 1 && <FlowArrow />}
            </div>
          ))}
        </div>
      </div>

      {/* Component Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Component Mapping Detail</h2>
        {mappings.map(({ icon: Icon, color, headerColor, gwComponent, insureflowComponent, description, gwFeatures, insureflowFeatures }) => (
          <div key={gwComponent} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${color}`}>
            <div className={`${headerColor} px-5 py-3 flex items-center gap-3`}>
              <Icon size={18} className="text-white" />
              <div>
                <p className="text-white font-semibold text-sm">{gwComponent}</p>
                <p className="text-white/70 text-xs">→ InsureFlow: {insureflowComponent}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-4">{description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guidewire {gwComponent} Features</p>
                  <ul className="space-y-1">
                    {gwFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">InsureFlow Implementation</p>
                  <ul className="space-y-1">
                    {insureflowFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
