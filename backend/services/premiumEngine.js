/**
 * PremiumEngine - InsureFlow Business Rule Service
 * Inspired by Gosu-style business rules in Guidewire PolicyCenter.
 *
 * This service encapsulates all premium calculation logic in one place,
 * separate from controllers and routes — following the Gosu concept of
 * dedicated business rule classes in Guidewire InsuranceSuite.
 */

const LOCATION_RISK = {
  mumbai: 1500,
  delhi: 1400,
  bangalore: 1200,
  chennai: 1100,
  hyderabad: 1000,
  kolkata: 1300,
  pune: 900,
  ahmedabad: 800,
  default: 500,
};

/**
 * Calculate motor insurance premium.
 * Gosu equivalent:
 *   class PremiumCalculator {
 *     function calculatePremium(vehicleValue, driverAge, previousClaims, coverageType) : BigDecimal { ... }
 *   }
 */
function calculatePremium({
  vehicleValue,
  driverAge,
  vehicleYear,
  previousClaims = 0,
  coverageType,
  location = '',
}) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicleYear;

  // --- BASE PREMIUM ---
  // Rule: Base premium = 3% of vehicle value
  const basePremium = Math.round(vehicleValue * 0.03);

  // --- DRIVER AGE RISK ---
  let driverRiskAdjustment = 0;
  if (driverAge < 25) {
    driverRiskAdjustment = 5000; // Young driver — high risk
  } else if (driverAge >= 25 && driverAge <= 40) {
    driverRiskAdjustment = 2000; // Prime age — moderate risk
  } else {
    driverRiskAdjustment = 1000; // Senior driver — lower risk
  }

  // --- CLAIM HISTORY ---
  let claimHistoryAdjustment = 0;
  if (previousClaims === 0) {
    claimHistoryAdjustment = -2000; // No-claim bonus
  } else if (previousClaims >= 1 && previousClaims <= 2) {
    claimHistoryAdjustment = 3000; // Some claims — moderate loading
  } else {
    claimHistoryAdjustment = 6000; // Many claims — high loading
  }

  // --- VEHICLE AGE ---
  let vehicleAgeAdjustment = 0;
  if (vehicleAge > 8) {
    vehicleAgeAdjustment = 3000; // Old vehicle — higher risk
  }

  // --- COVERAGE TYPE ---
  let coverageAdjustment = 0;
  if (coverageType === 'comprehensive') {
    coverageAdjustment = 5000;
  } else {
    coverageAdjustment = 1500; // Third party — cheaper
  }

  // --- LOCATION RISK ---
  const locationKey = location.toLowerCase().trim();
  let locationRiskAdjustment =
    LOCATION_RISK[locationKey] !== undefined
      ? LOCATION_RISK[locationKey]
      : LOCATION_RISK.default;

  // --- FINAL PREMIUM ---
  const finalPremium =
    basePremium +
    driverRiskAdjustment +
    claimHistoryAdjustment +
    vehicleAgeAdjustment +
    coverageAdjustment +
    locationRiskAdjustment;

  return {
    basePremium,
    driverRiskAdjustment,
    claimHistoryAdjustment,
    vehicleAgeAdjustment,
    coverageAdjustment,
    locationRiskAdjustment,
    finalPremium: Math.max(finalPremium, 5000), // Minimum premium floor
    breakdown: {
      basePremium,
      driverRisk: {
        amount: driverRiskAdjustment,
        reason:
          driverAge < 25
            ? 'Young driver (< 25 years) — higher risk'
            : driverAge <= 40
            ? 'Prime age driver (25–40 years)'
            : 'Senior driver (> 40 years)',
      },
      claimHistory: {
        amount: claimHistoryAdjustment,
        reason:
          previousClaims === 0
            ? 'No previous claims — NCB discount applied'
            : previousClaims <= 2
            ? `${previousClaims} previous claim(s) — moderate loading`
            : `${previousClaims} previous claims — high loading`,
      },
      vehicleAge: {
        amount: vehicleAgeAdjustment,
        reason:
          vehicleAge > 8
            ? `Vehicle is ${vehicleAge} years old — additional loading`
            : `Vehicle is ${vehicleAge} years old — no loading`,
      },
      coverage: {
        amount: coverageAdjustment,
        reason:
          coverageType === 'comprehensive'
            ? 'Comprehensive coverage'
            : 'Third Party coverage',
      },
      locationRisk: {
        amount: locationRiskAdjustment,
        reason: `Location risk loading for ${location}`,
      },
    },
  };
}

module.exports = { calculatePremium };
