const { calculatePremium } = require('../services/premiumEngine');
const { assessRisk } = require('../services/fraudEngine');

describe('Premium Engine', () => {
  test('should calculate base premium as 3% of vehicle value', () => {
    const result = calculatePremium({
      vehicleValue: 500000,
      driverAge: 30,
      vehicleYear: 2020,
      previousClaims: 0,
      coverageType: 'third_party',
      location: 'Other',
    });
    expect(result.basePremium).toBe(15000);
  });

  test('young driver (<25) should have +5000 risk loading', () => {
    const result = calculatePremium({
      vehicleValue: 500000,
      driverAge: 22,
      vehicleYear: 2020,
      previousClaims: 0,
      coverageType: 'third_party',
      location: 'Other',
    });
    expect(result.driverRiskAdjustment).toBe(5000);
  });

  test('prime age driver (25-40) should have +2000 loading', () => {
    const result = calculatePremium({
      vehicleValue: 500000,
      driverAge: 32,
      vehicleYear: 2020,
      previousClaims: 0,
      coverageType: 'third_party',
      location: 'Other',
    });
    expect(result.driverRiskAdjustment).toBe(2000);
  });

  test('no previous claims should give -2000 NCB discount', () => {
    const result = calculatePremium({
      vehicleValue: 500000,
      driverAge: 30,
      vehicleYear: 2020,
      previousClaims: 0,
      coverageType: 'third_party',
      location: 'Other',
    });
    expect(result.claimHistoryAdjustment).toBe(-2000);
  });

  test('more than 2 previous claims should load +6000', () => {
    const result = calculatePremium({
      vehicleValue: 500000,
      driverAge: 30,
      vehicleYear: 2020,
      previousClaims: 4,
      coverageType: 'third_party',
      location: 'Other',
    });
    expect(result.claimHistoryAdjustment).toBe(6000);
  });

  test('comprehensive coverage should add +5000', () => {
    const result = calculatePremium({
      vehicleValue: 500000,
      driverAge: 30,
      vehicleYear: 2020,
      previousClaims: 0,
      coverageType: 'comprehensive',
      location: 'Other',
    });
    expect(result.coverageAdjustment).toBe(5000);
  });

  test('vehicle older than 8 years should add +3000', () => {
    const result = calculatePremium({
      vehicleValue: 500000,
      driverAge: 30,
      vehicleYear: 2010,
      previousClaims: 0,
      coverageType: 'third_party',
      location: 'Other',
    });
    expect(result.vehicleAgeAdjustment).toBe(3000);
  });

  test('final premium should never go below 5000', () => {
    const result = calculatePremium({
      vehicleValue: 10000,
      driverAge: 50,
      vehicleYear: new Date().getFullYear(),
      previousClaims: 0,
      coverageType: 'third_party',
      location: 'Other',
    });
    expect(result.finalPremium).toBeGreaterThanOrEqual(5000);
  });
});

describe('Fraud/Risk Engine', () => {
  const basePolicy = {
    previousClaims: 0,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    vehicleValue: 500000,
    vehicleYear: new Date().getFullYear() - 2,
  };

  const baseClaim = {
    accidentDate: new Date(),
    estimatedDamage: 50000,
    accidentType: 'collision',
  };

  test('LOW risk — clean claim with recent policy', () => {
    const result = assessRisk({ claim: baseClaim, policy: basePolicy });
    expect(result.riskLevel).toBe('LOW');
    expect(result.riskScore).toBeLessThanOrEqual(30);
  });

  test('HIGH risk — many claims + early claim + high damage ratio', () => {
    const result = assessRisk({
      claim: { ...baseClaim, estimatedDamage: 450000 },
      policy: {
        ...basePolicy,
        previousClaims: 4,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    });
    expect(result.riskLevel).toBe('HIGH');
    expect(result.riskScore).toBeGreaterThan(60);
  });

  test('should flag early claim (< 30 days)', () => {
    const result = assessRisk({
      claim: baseClaim,
      policy: {
        ...basePolicy,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    });
    expect(result.riskFactors.some((f) => f.includes('day'))).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  test('should flag claim exceeding 80% of vehicle value', () => {
    const result = assessRisk({
      claim: { ...baseClaim, estimatedDamage: 430000 },
      policy: { ...basePolicy, vehicleValue: 500000 },
    });
    expect(result.riskFactors.some((f) => f.includes('%'))).toBe(true);
  });

  test('risk score should never exceed 100', () => {
    const result = assessRisk({
      claim: { ...baseClaim, estimatedDamage: 999999 },
      policy: {
        ...basePolicy,
        previousClaims: 10,
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});
