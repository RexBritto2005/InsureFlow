/**
 * FraudEngine - InsureFlow Risk & Fraud Assessment Service
 * Inspired by Gosu-style business rules in Guidewire ClaimCenter.
 *
 * Deterministic rule-based risk scoring engine.
 * Returns a score 0–100, risk level, and list of risk factors.
 *
 * Gosu equivalent:
 *   class FraudRiskAssessor {
 *     function assessRisk(claim : Claim, policy : Policy) : RiskAssessment { ... }
 *   }
 */

function assessRisk({ claim, policy }) {
  let riskScore = 0;
  const riskFactors = [];

  const claimDate = new Date(claim.accidentDate || Date.now());
  const policyStart = new Date(policy.startDate || policy.createdAt);
  const policyAgeDays = Math.floor(
    (claimDate - policyStart) / (1000 * 60 * 60 * 24)
  );
  const createdAt = new Date(policy.createdAt);
  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt) / (1000 * 60 * 60 * 24)
  );

  // Rule 1: Multiple previous claims
  if (policy.previousClaims > 3) {
    riskScore += 25;
    riskFactors.push(
      `Multiple previous claims (${policy.previousClaims}) — high claim history`
    );
  } else if (policy.previousClaims >= 2) {
    riskScore += 10;
    riskFactors.push(`${policy.previousClaims} previous claims on record`);
  }

  // Rule 2: Claim submitted shortly after policy activation
  if (policyAgeDays < 30) {
    riskScore += 20;
    riskFactors.push(
      `Claim submitted only ${policyAgeDays} day(s) after policy activation`
    );
  } else if (policyAgeDays < 60) {
    riskScore += 10;
    riskFactors.push(
      `Claim submitted ${policyAgeDays} days after policy activation — early claim`
    );
  }

  // Rule 3: Claim amount vs vehicle value
  const claimRatio = claim.estimatedDamage / policy.vehicleValue;
  if (claimRatio > 1.0) {
    riskScore += 25;
    riskFactors.push(
      `Claim amount (₹${claim.estimatedDamage.toLocaleString()}) exceeds vehicle value (₹${policy.vehicleValue.toLocaleString()})`
    );
  } else if (claimRatio >= 0.8) {
    riskScore += 25;
    riskFactors.push(
      `Claim amount is ${Math.round(claimRatio * 100)}% of vehicle value — very high ratio`
    );
  } else if (claimRatio >= 0.5) {
    riskScore += 10;
    riskFactors.push(
      `Claim amount is ${Math.round(claimRatio * 100)}% of vehicle value — elevated ratio`
    );
  }

  // Rule 4: High absolute claim amount
  if (claim.estimatedDamage > 100000) {
    riskScore += 10;
    riskFactors.push(
      `High absolute claim amount: ₹${claim.estimatedDamage.toLocaleString()}`
    );
  }

  // Rule 5: Vehicle very new and claim shortly after creation
  const vehicleAge = new Date().getFullYear() - policy.vehicleYear;
  if (vehicleAge <= 1 && daysSinceCreation < 30) {
    riskScore += 10;
    riskFactors.push(
      'New vehicle with claim filed shortly after policy creation'
    );
  }

  // Rule 6: Theft/fire claims are higher risk
  if (claim.accidentType === 'theft') {
    riskScore += 5;
    riskFactors.push('Theft claim — requires additional verification');
  } else if (claim.accidentType === 'fire') {
    riskScore += 5;
    riskFactors.push('Fire damage claim — requires investigation');
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100);

  // Risk classification
  let riskLevel;
  if (riskScore <= 30) {
    riskLevel = 'LOW';
  } else if (riskScore <= 60) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  return {
    riskScore,
    riskLevel,
    riskFactors:
      riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'],
  };
}

module.exports = { assessRisk };
