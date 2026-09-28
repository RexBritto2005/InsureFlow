require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Policy = require('../models/Policy');
const Quote = require('../models/Quote');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');

async function seed() {
  await connectDB();

  console.log('🌱 Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Policy.deleteMany({}),
    Quote.deleteMany({}),
    Claim.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  console.log('👤 Creating users...');
  const salt = await bcrypt.genSalt(10);

  const users = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@insureflow.com',
      password: await bcrypt.hash('Admin@123', salt),
      phone: '9000000001',
      role: 'admin',
    },
    {
      name: 'Rahul Sharma',
      email: 'customer@insureflow.com',
      password: await bcrypt.hash('Customer@123', salt),
      phone: '9000000002',
      role: 'customer',
    },
    {
      name: 'Priya Nair',
      email: 'priya@insureflow.com',
      password: await bcrypt.hash('Customer@123', salt),
      phone: '9000000003',
      role: 'customer',
    },
    {
      name: 'Amit Verma',
      email: 'amit@insureflow.com',
      password: await bcrypt.hash('Customer@123', salt),
      phone: '9000000004',
      role: 'customer',
    },
    {
      name: 'Sunita Patel',
      email: 'sunita@insureflow.com',
      password: await bcrypt.hash('Customer@123', salt),
      phone: '9000000005',
      role: 'customer',
    },
    {
      name: 'Deepak Mehta',
      email: 'deepak@insureflow.com',
      password: await bcrypt.hash('Customer@123', salt),
      phone: '9000000006',
      role: 'customer',
    },
    {
      name: 'Agent Kumar',
      email: 'agent@insureflow.com',
      password: await bcrypt.hash('Agent@123', salt),
      phone: '9000000007',
      role: 'agent',
    },
    {
      name: 'Agent Meera',
      email: 'agent2@insureflow.com',
      password: await bcrypt.hash('Agent@123', salt),
      phone: '9000000008',
      role: 'agent',
    },
    {
      name: 'Adjuster Singh',
      email: 'adjuster@insureflow.com',
      password: await bcrypt.hash('Adjuster@123', salt),
      phone: '9000000009',
      role: 'adjuster',
    },
    {
      name: 'Adjuster Latha',
      email: 'adjuster2@insureflow.com',
      password: await bcrypt.hash('Adjuster@123', salt),
      phone: '9000000010',
      role: 'adjuster',
    },
  ]);

  const admin = users[0];
  const customer1 = users[1];
  const customer2 = users[2];
  const customer3 = users[3];
  const customer4 = users[4];
  const customer5 = users[5];
  const agent1 = users[6];
  const adjuster1 = users[8];

  console.log('📋 Creating policies...');

  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  const policies = await Policy.insertMany([
    {
      policyNumber: 'POL-10001',
      customerId: customer1._id,
      agentId: agent1._id,
      vehicleMake: 'Maruti',
      vehicleModel: 'Swift',
      vehicleYear: 2020,
      vehicleValue: 650000,
      driverAge: 32,
      previousClaims: 0,
      location: 'Mumbai',
      coverageType: 'comprehensive',
      startDate: sixMonthsAgo,
      expiryDate: new Date(sixMonthsAgo.getFullYear() + 1, sixMonthsAgo.getMonth(), sixMonthsAgo.getDate()),
      premium: 26000,
      premiumBreakdown: {
        basePremium: 19500,
        driverRiskAdjustment: 2000,
        claimHistoryAdjustment: -2000,
        vehicleAgeAdjustment: 0,
        coverageAdjustment: 5000,
        locationRiskAdjustment: 1500,
      },
      status: 'active',
    },
    {
      policyNumber: 'POL-10002',
      customerId: customer1._id,
      agentId: agent1._id,
      vehicleMake: 'Honda',
      vehicleModel: 'City',
      vehicleYear: 2018,
      vehicleValue: 850000,
      driverAge: 32,
      previousClaims: 1,
      location: 'Mumbai',
      coverageType: 'comprehensive',
      startDate: oneYearAgo,
      expiryDate: new Date(oneYearAgo.getFullYear() + 1, oneYearAgo.getMonth(), oneYearAgo.getDate()),
      premium: 35500,
      premiumBreakdown: {
        basePremium: 25500,
        driverRiskAdjustment: 2000,
        claimHistoryAdjustment: 3000,
        vehicleAgeAdjustment: 0,
        coverageAdjustment: 5000,
        locationRiskAdjustment: 1500,
      },
      status: 'active',
    },
    {
      policyNumber: 'POL-10003',
      customerId: customer2._id,
      agentId: agent1._id,
      vehicleMake: 'Hyundai',
      vehicleModel: 'i20',
      vehicleYear: 2022,
      vehicleValue: 750000,
      driverAge: 24,
      previousClaims: 0,
      location: 'Bangalore',
      coverageType: 'comprehensive',
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      expiryDate: new Date(now.getFullYear() + 1, now.getMonth() - 3, now.getDate()),
      premium: 36200,
      premiumBreakdown: {
        basePremium: 22500,
        driverRiskAdjustment: 5000,
        claimHistoryAdjustment: -2000,
        vehicleAgeAdjustment: 0,
        coverageAdjustment: 5000,
        locationRiskAdjustment: 1200,
      },
      status: 'active',
    },
    {
      policyNumber: 'POL-10004',
      customerId: customer3._id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Fortuner',
      vehicleYear: 2015,
      vehicleValue: 1800000,
      driverAge: 45,
      previousClaims: 4,
      location: 'Delhi',
      coverageType: 'comprehensive',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() - 5),
      expiryDate: new Date(now.getFullYear() + 1, now.getMonth() - 1, now.getDate() - 5),
      premium: 72400,
      premiumBreakdown: {
        basePremium: 54000,
        driverRiskAdjustment: 1000,
        claimHistoryAdjustment: 6000,
        vehicleAgeAdjustment: 3000,
        coverageAdjustment: 5000,
        locationRiskAdjustment: 1400,
      },
      status: 'active',
    },
    {
      policyNumber: 'POL-10005',
      customerId: customer4._id,
      vehicleMake: 'Tata',
      vehicleModel: 'Nexon',
      vehicleYear: 2021,
      vehicleValue: 900000,
      driverAge: 28,
      previousClaims: 0,
      location: 'Chennai',
      coverageType: 'third_party',
      startDate: new Date(now.getFullYear(), now.getMonth() - 4, now.getDate()),
      expiryDate: new Date(now.getFullYear() + 1, now.getMonth() - 4, now.getDate()),
      premium: 22100,
      premiumBreakdown: {
        basePremium: 27000,
        driverRiskAdjustment: 2000,
        claimHistoryAdjustment: -2000,
        vehicleAgeAdjustment: 0,
        coverageAdjustment: 1500,
        locationRiskAdjustment: 1100,
      },
      status: 'active',
    },
    {
      policyNumber: 'POL-10006',
      customerId: customer5._id,
      vehicleMake: 'Kia',
      vehicleModel: 'Seltos',
      vehicleYear: 2023,
      vehicleValue: 1400000,
      driverAge: 21,
      previousClaims: 0,
      location: 'Hyderabad',
      coverageType: 'comprehensive',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
      expiryDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate() - 10),
      premium: 56000,
      premiumBreakdown: {
        basePremium: 42000,
        driverRiskAdjustment: 5000,
        claimHistoryAdjustment: -2000,
        vehicleAgeAdjustment: 0,
        coverageAdjustment: 5000,
        locationRiskAdjustment: 1000,
      },
      status: 'active',
    },
    {
      policyNumber: 'POL-10007',
      customerId: customer2._id,
      vehicleMake: 'Mahindra',
      vehicleModel: 'Thar',
      vehicleYear: 2012,
      vehicleValue: 600000,
      driverAge: 24,
      previousClaims: 2,
      location: 'Pune',
      coverageType: 'third_party',
      startDate: oneYearAgo,
      expiryDate: new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth(), oneYearAgo.getDate() - 1),
      premium: 18900,
      premiumBreakdown: {
        basePremium: 18000,
        driverRiskAdjustment: 5000,
        claimHistoryAdjustment: 3000,
        vehicleAgeAdjustment: 3000,
        coverageAdjustment: 1500,
        locationRiskAdjustment: 900,
      },
      status: 'expired',
    },
    {
      policyNumber: 'POL-10008',
      customerId: customer3._id,
      vehicleMake: 'Volkswagen',
      vehicleModel: 'Polo',
      vehicleYear: 2019,
      vehicleValue: 700000,
      driverAge: 45,
      previousClaims: 1,
      location: 'Kolkata',
      coverageType: 'comprehensive',
      startDate: sixMonthsAgo,
      expiryDate: new Date(sixMonthsAgo.getFullYear() + 1, sixMonthsAgo.getMonth(), sixMonthsAgo.getDate()),
      premium: 31300,
      premiumBreakdown: {
        basePremium: 21000,
        driverRiskAdjustment: 1000,
        claimHistoryAdjustment: 3000,
        vehicleAgeAdjustment: 0,
        coverageAdjustment: 5000,
        locationRiskAdjustment: 1300,
      },
      status: 'active',
    },
  ]);

  console.log('📝 Creating claims...');

  const claims = await Claim.insertMany([
    // LOW risk - APPROVED
    {
      claimNumber: 'CLM-10001',
      policyId: policies[0]._id,
      customerId: customer1._id,
      adjusterId: adjuster1._id,
      accidentDate: new Date(now.getFullYear(), now.getMonth() - 2, 15),
      accidentLocation: 'Andheri, Mumbai',
      accidentType: 'collision',
      description: 'Minor rear-end collision at traffic signal. Bumper and boot damaged.',
      estimatedDamage: 45000,
      imageUrl: '',
      riskScore: 15,
      riskLevel: 'LOW',
      riskFactors: ['No significant risk factors identified'],
      status: 'APPROVED',
      adjusterNotes: 'Straightforward collision claim. Damage consistent with description.',
      statusHistory: [
        { status: 'SUBMITTED', notes: 'Claim submitted by customer' },
        { status: 'UNDER_REVIEW', notes: 'Assigned to adjuster' },
        { status: 'APPROVED', notes: 'Approved after verification' },
      ],
    },
    // LOW risk - SETTLED
    {
      claimNumber: 'CLM-10002',
      policyId: policies[1]._id,
      customerId: customer1._id,
      adjusterId: adjuster1._id,
      accidentDate: new Date(now.getFullYear(), now.getMonth() - 3, 8),
      accidentLocation: 'Bandra, Mumbai',
      accidentType: 'vandalism',
      description: 'Vehicle windshield broken, door scratched during overnight parking.',
      estimatedDamage: 28000,
      imageUrl: '',
      riskScore: 20,
      riskLevel: 'LOW',
      riskFactors: ['No significant risk factors identified'],
      status: 'SETTLED',
      settlementAmount: 26000,
      adjusterNotes: 'Vandalism confirmed. Settlement issued minus deductible.',
      statusHistory: [
        { status: 'SUBMITTED', notes: 'Claim submitted by customer' },
        { status: 'UNDER_REVIEW', notes: 'Under review' },
        { status: 'APPROVED', notes: 'Approved' },
        { status: 'SETTLED', notes: 'Settled for ₹26,000' },
      ],
    },
    // MEDIUM risk - UNDER_REVIEW
    {
      claimNumber: 'CLM-10003',
      policyId: policies[2]._id,
      customerId: customer2._id,
      accidentDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      accidentLocation: 'Whitefield, Bangalore',
      accidentType: 'collision',
      description: 'Collision with another vehicle at intersection. Significant front-end damage.',
      estimatedDamage: 420000,
      imageUrl: '',
      riskScore: 45,
      riskLevel: 'MEDIUM',
      riskFactors: ['Claim amount is 56% of vehicle value — elevated ratio'],
      status: 'UNDER_REVIEW',
      statusHistory: [
        { status: 'SUBMITTED', notes: 'Claim submitted by customer' },
        { status: 'UNDER_REVIEW', notes: 'Under adjuster review' },
      ],
    },
    // HIGH risk - INVESTIGATION
    {
      claimNumber: 'CLM-10004',
      policyId: policies[3]._id,
      customerId: customer3._id,
      adjusterId: adjuster1._id,
      accidentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      accidentLocation: 'NH-48, Delhi',
      accidentType: 'collision',
      description: 'Major collision on highway. Entire front section destroyed.',
      estimatedDamage: 1500000,
      imageUrl: '',
      riskScore: 80,
      riskLevel: 'HIGH',
      riskFactors: [
        'Multiple previous claims (4) — high claim history',
        'Claim submitted only 2 day(s) after policy activation',
        'Claim amount is 83% of vehicle value — very high ratio',
        'High absolute claim amount: ₹1,500,000',
      ],
      status: 'INVESTIGATION',
      adjusterNotes: 'High risk case. Requires investigation and verification of all documents.',
      statusHistory: [
        { status: 'SUBMITTED', notes: 'Claim submitted by customer' },
        { status: 'INVESTIGATION', notes: 'Automatically flagged for investigation due to high risk score' },
      ],
    },
    // MEDIUM risk - REJECTED
    {
      claimNumber: 'CLM-10005',
      policyId: policies[4]._id,
      customerId: customer4._id,
      adjusterId: adjuster1._id,
      accidentDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      accidentLocation: 'Anna Salai, Chennai',
      accidentType: 'theft',
      description: 'Vehicle accessories stolen overnight. Audio system and alloy wheels missing.',
      estimatedDamage: 85000,
      imageUrl: '',
      riskScore: 35,
      riskLevel: 'MEDIUM',
      riskFactors: ['Theft claim — requires additional verification'],
      status: 'REJECTED',
      rejectionReason: 'No police FIR filed. Claim not supported by required documentation.',
      adjusterNotes: 'Customer unable to provide police report.',
      statusHistory: [
        { status: 'SUBMITTED', notes: 'Claim submitted by customer' },
        { status: 'UNDER_REVIEW', notes: 'Under review' },
        { status: 'REJECTED', notes: 'Rejected — insufficient documentation' },
      ],
    },
    // HIGH risk - INVESTIGATION (new vehicle, recent policy)
    {
      claimNumber: 'CLM-10006',
      policyId: policies[5]._id,
      customerId: customer5._id,
      accidentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      accidentLocation: 'HITEC City, Hyderabad',
      accidentType: 'fire',
      description: 'Vehicle caught fire in parking lot. Engine and electrical system badly damaged.',
      estimatedDamage: 950000,
      imageUrl: '',
      riskScore: 70,
      riskLevel: 'HIGH',
      riskFactors: [
        'Claim submitted only 5 day(s) after policy activation',
        'Claim amount is 67% of vehicle value — elevated ratio',
        'New vehicle with claim filed shortly after policy creation',
        'Fire damage claim — requires investigation',
      ],
      status: 'INVESTIGATION',
      statusHistory: [
        { status: 'SUBMITTED', notes: 'Claim submitted by customer' },
        { status: 'INVESTIGATION', notes: 'Automatically flagged for investigation due to high risk score' },
      ],
    },
  ]);

  console.log('💳 Creating payments...');

  await Payment.insertMany([
    {
      paymentNumber: 'PAY-10001',
      policyId: policies[0]._id,
      customerId: customer1._id,
      amount: 26000,
      paymentMethod: 'net_banking',
      status: 'SUCCESS',
      transactionDate: sixMonthsAgo,
      description: `Premium payment for policy POL-10001`,
    },
    {
      paymentNumber: 'PAY-10002',
      policyId: policies[1]._id,
      customerId: customer1._id,
      amount: 35500,
      paymentMethod: 'credit_card',
      status: 'SUCCESS',
      transactionDate: oneYearAgo,
      description: `Premium payment for policy POL-10002`,
    },
    {
      paymentNumber: 'PAY-10003',
      policyId: policies[2]._id,
      customerId: customer2._id,
      amount: 36200,
      paymentMethod: 'upi',
      status: 'SUCCESS',
      transactionDate: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      description: `Premium payment for policy POL-10003`,
    },
    {
      paymentNumber: 'PAY-10004',
      policyId: policies[3]._id,
      customerId: customer3._id,
      amount: 72400,
      paymentMethod: 'net_banking',
      status: 'SUCCESS',
      transactionDate: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() - 5),
      description: `Premium payment for policy POL-10004`,
    },
    {
      paymentNumber: 'PAY-10005',
      policyId: policies[4]._id,
      customerId: customer4._id,
      amount: 22100,
      paymentMethod: 'debit_card',
      status: 'SUCCESS',
      transactionDate: new Date(now.getFullYear(), now.getMonth() - 4, now.getDate()),
      description: `Premium payment for policy POL-10005`,
    },
    {
      paymentNumber: 'PAY-10006',
      policyId: policies[5]._id,
      customerId: customer5._id,
      amount: 56000,
      paymentMethod: 'upi',
      status: 'SUCCESS',
      transactionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
      description: `Premium payment for policy POL-10006`,
    },
    {
      paymentNumber: 'PAY-10007',
      policyId: policies[6]._id,
      customerId: customer2._id,
      amount: 18900,
      paymentMethod: 'net_banking',
      status: 'SUCCESS',
      transactionDate: oneYearAgo,
      description: `Premium payment for policy POL-10007`,
    },
    {
      paymentNumber: 'PAY-10008',
      policyId: policies[7]._id,
      customerId: customer3._id,
      amount: 31300,
      paymentMethod: 'credit_card',
      status: 'SUCCESS',
      transactionDate: sixMonthsAgo,
      description: `Premium payment for policy POL-10008`,
    },
  ]);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin:     admin@insureflow.com     / Admin@123');
  console.log('  Customer:  customer@insureflow.com  / Customer@123');
  console.log('  Customer2: priya@insureflow.com     / Customer@123');
  console.log('  Agent:     agent@insureflow.com     / Agent@123');
  console.log('  Adjuster:  adjuster@insureflow.com  / Adjuster@123');
  console.log('\n📊 Created:');
  console.log('  10 Users (1 admin, 5 customers, 2 agents, 2 adjusters)');
  console.log('  8 Policies');
  console.log('  6 Claims (2 LOW, 2 MEDIUM, 2 HIGH risk)');
  console.log('  8 Payments');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
