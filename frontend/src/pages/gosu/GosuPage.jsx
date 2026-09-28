import { Code2, Info, AlertTriangle } from 'lucide-react';

function CodeBlock({ title, code, description }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-300 text-xs ml-2 font-mono">{title}</span>
      </div>
      {description && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      )}
      <pre className="bg-gray-900 text-green-300 text-xs font-mono overflow-x-auto p-5 leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

const gosuPremium = `// ================================================
// Gosu Concept Demonstration — Premium Calculation
// Guidewire PolicyCenter Business Rule
// ================================================
// NOTE: This is for concept demonstration only.
// Actual InsureFlow backend uses JavaScript.
// Gosu is Guidewire's proprietary language.
// ================================================

uses java.math.BigDecimal

class PremiumCalculator {

  /**
   * Calculate motor insurance premium based on
   * vehicle, driver, and policy parameters.
   */
  function calculatePremium(
    vehicleValue   : BigDecimal,
    driverAge      : int,
    vehicleYear    : int,
    previousClaims : int,
    coverageType   : String,
    location       : String
  ) : BigDecimal {

    var currentYear = java.util.Calendar.getInstance().get(Calendar.YEAR)
    var vehicleAge  = currentYear - vehicleYear

    // --- BASE PREMIUM: 3% of vehicle value ---
    var premium = vehicleValue * 0.03

    // --- DRIVER AGE RISK ---
    if (driverAge < 25) {
      premium += 5000     // Young driver — high risk
    } else if (driverAge >= 25 and driverAge <= 40) {
      premium += 2000     // Prime age
    } else {
      premium += 1000     // Senior driver
    }

    // --- CLAIM HISTORY ---
    if (previousClaims == 0) {
      premium -= 2000     // No-Claim Bonus (NCB)
    } else if (previousClaims >= 1 and previousClaims <= 2) {
      premium += 3000
    } else {
      premium += 6000     // Multiple claims — high loading
    }

    // --- VEHICLE AGE ---
    if (vehicleAge > 8) {
      premium += 3000
    }

    // --- COVERAGE TYPE ---
    if (coverageType == "comprehensive") {
      premium += 5000
    } else {
      premium += 1500     // Third party — lower coverage
    }

    // Minimum premium floor
    return premium < 5000 ? 5000 : premium
  }
}`;

const gosuClaimValidation = `// ================================================
// Gosu Concept Demonstration — Claim Validation
// Guidewire ClaimCenter Business Rule
// ================================================

uses gw.api.util.DateUtil

class ClaimValidator {

  function validateClaim(claim : Claim) : ValidationResult {

    var errors = new java.util.ArrayList<String>()

    // Accident date cannot be in the future
    if (claim.AccidentDate > DateUtil.today()) {
      errors.add("Accident date cannot be in the future")
    }

    // Policy must be active at time of accident
    if (claim.Policy.Status != PolicyStatus.TC_INFORCE) {
      errors.add("Policy was not active on the accident date")
    }

    // Damage estimate must be positive
    if (claim.EstimatedDamage <= 0) {
      errors.add("Estimated damage must be a positive value")
    }

    // Description must have sufficient detail
    if (claim.Description.length() < 20) {
      errors.add("Claim description must be at least 20 characters")
    }

    // Claim date must be within policy period
    if (claim.AccidentDate < claim.Policy.PeriodStart
        or claim.AccidentDate > claim.Policy.PeriodEnd) {
      errors.add("Accident date is outside the policy period")
    }

    return new ValidationResult(errors.isEmpty(), errors)
  }
}`;

const gosuRiskEngine = `// ================================================
// Gosu Concept Demonstration — Risk / Fraud Engine
// Guidewire ClaimCenter Fraud Detection Rule
// ================================================

class FraudRiskAssessor {

  var MAX_RISK_SCORE : int = 100

  function assessRisk(claim : Claim) : RiskAssessment {

    var score       = 0
    var riskFactors = new java.util.ArrayList<String>()

    var policy    = claim.Policy
    var policyAge = DateUtil.daysBetween(policy.PeriodStart, claim.AccidentDate)

    // Rule 1: Multiple previous claims on record
    if (policy.PreviousClaims > 3) {
      score += 25
      riskFactors.add("Multiple previous claims — high claim history")
    } else if (policy.PreviousClaims >= 2) {
      score += 10
    }

    // Rule 2: Early claim — policy activated recently
    if (policyAge < 30) {
      score += 20
      riskFactors.add("Claim submitted only " + policyAge + " days after policy activation")
    } else if (policyAge < 60) {
      score += 10
    }

    // Rule 3: Claim amount ratio vs vehicle value
    var ratio = claim.EstimatedDamage / policy.VehicleValue
    if (ratio >= 0.8) {
      score += 25
      riskFactors.add("Claim amount is " + (ratio * 100).intValue() + "% of vehicle value")
    } else if (ratio >= 0.5) {
      score += 10
    }

    // Rule 4: Absolute high value
    if (claim.EstimatedDamage > 100000) {
      score += 10
      riskFactors.add("High absolute claim amount")
    }

    // Rule 5: Theft or fire — higher scrutiny
    if (claim.AccidentType == "theft" or claim.AccidentType == "fire") {
      score += 5
      riskFactors.add(claim.AccidentType + " claim requires additional verification")
    }

    score = Math.min(score, MAX_RISK_SCORE)

    var level : RiskLevel
    if (score <= 30) {
      level = RiskLevel.TC_LOW
    } else if (score <= 60) {
      level = RiskLevel.TC_MEDIUM
    } else {
      level = RiskLevel.TC_HIGH
    }

    return new RiskAssessment(score, level, riskFactors)
  }
}`;

export default function GosuPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Rules — Gosu Concept</h1>
        <p className="text-sm text-gray-500 mt-1">Demonstrating how InsureFlow rules map to Guidewire Gosu</p>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Gosu Concept Demonstration — Not actual Gosu code running in production</p>
          <p className="text-sm text-amber-700 mt-1">
            The code below demonstrates how InsureFlow&apos;s business rules <em>would be expressed</em> in
            Guidewire&apos;s Gosu language if implemented in an actual Guidewire PolicyCenter/ClaimCenter environment.
            InsureFlow&apos;s actual backend uses <strong>JavaScript (Node.js)</strong> with equivalent rule logic in
            <code className="bg-amber-100 px-1 rounded">premiumEngine.js</code> and <code className="bg-amber-100 px-1 rounded">fraudEngine.js</code>.
          </p>
        </div>
      </div>

      {/* What is Gosu */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code2 size={18} className="text-purple-600" />
          <h2 className="text-sm font-semibold text-gray-900">What is Gosu?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Gosu is a statically-typed, JVM-based programming language developed by Guidewire Software
              specifically for its InsuranceSuite platform (PolicyCenter, ClaimCenter, BillingCenter).
            </p>
            <ul className="mt-3 space-y-1.5">
              {[
                'Tightly integrated with Guidewire entity model',
                'Used for PCF UI backing code and rules',
                'Supports type inference and null safety',
                'Business rule classes and decision tables',
                'Validation rules and workflow triggers',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">InsureFlow Equivalent</p>
            <div className="space-y-2">
              {[
                { gosu: 'PremiumCalculator.gsx', js: 'premiumEngine.js' },
                { gosu: 'FraudRiskAssessor.gsx', js: 'fraudEngine.js' },
                { gosu: 'ClaimValidator.gsx', js: 'claimController.js validation' },
                { gosu: 'PolicyCenter PCF', js: 'React Quote/Policy pages' },
                { gosu: 'ClaimCenter PCF', js: 'React Claims pages' },
              ].map(({ gosu, js }) => (
                <div key={gosu} className="flex items-center gap-2 text-xs">
                  <code className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex-1">{gosu}</code>
                  <span className="text-gray-400">→</span>
                  <code className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex-1">{js}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <CodeBlock
        title="PremiumCalculator.gsx — Gosu Concept"
        description="Premium calculation business rules as they would appear in Guidewire PolicyCenter using Gosu."
        code={gosuPremium}
      />

      <CodeBlock
        title="ClaimValidator.gsx — Gosu Concept"
        description="Claim validation rules as they would appear in Guidewire ClaimCenter using Gosu."
        code={gosuClaimValidation}
      />

      <CodeBlock
        title="FraudRiskAssessor.gsx — Gosu Concept"
        description="Fraud and risk scoring rules as they would appear in Guidewire ClaimCenter using Gosu."
        code={gosuRiskEngine}
      />

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Language Comparison: Gosu vs JavaScript</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Feature</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-purple-600 uppercase">Gosu (Guidewire)</th>
                <th className="text-left py-2 text-xs font-semibold text-blue-600 uppercase">JavaScript (InsureFlow)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Type System', 'Statically typed', 'Dynamically typed'],
                ['Runtime', 'JVM (Java Virtual Machine)', 'Node.js (V8 engine)'],
                ['Entity Access', 'Direct Guidewire entity model', 'Mongoose ODM / MongoDB'],
                ['Premium Rules', 'Gosu class with entity bindings', 'premiumEngine.js module'],
                ['Risk Assessment', 'Decision tables + Gosu logic', 'fraudEngine.js module'],
                ['UI Integration', 'PCF (Page Configuration Framework)', 'React components'],
                ['Deployment', 'Guidewire Cloud / On-premise', 'Node.js server / any cloud'],
                ['Purpose', 'Production insurance platform', 'Academic demonstration'],
              ].map(([feature, gosu, js]) => (
                <tr key={feature}>
                  <td className="py-2 pr-4 font-medium text-gray-700">{feature}</td>
                  <td className="py-2 pr-4 text-gray-600">{gosu}</td>
                  <td className="py-2 text-gray-600">{js}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
