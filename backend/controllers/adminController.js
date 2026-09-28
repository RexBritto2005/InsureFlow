const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalPolicies,
      activePolicies,
      totalClaims,
      claimsByStatus,
      riskDistribution,
      totalPremium,
      recentClaims,
      highRiskClaims,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Policy.countDocuments(),
      Policy.countDocuments({ status: 'active' }),
      Claim.countDocuments(),
      Claim.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Claim.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Claim.find()
        .populate('customerId', 'name email')
        .populate('policyId', 'policyNumber vehicleMake vehicleModel')
        .sort({ createdAt: -1 })
        .limit(10),
      Claim.find({ riskLevel: 'HIGH' })
        .populate('customerId', 'name email')
        .populate('policyId', 'policyNumber vehicleMake vehicleModel')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Shape claim status counts
    const statusCounts = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      INVESTIGATION: 0,
      APPROVED: 0,
      REJECTED: 0,
      SETTLED: 0,
    };
    claimsByStatus.forEach(({ _id, count }) => {
      if (statusCounts[_id] !== undefined) statusCounts[_id] = count;
    });

    // Shape risk distribution
    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    riskDistribution.forEach(({ _id, count }) => {
      if (riskCounts[_id] !== undefined) riskCounts[_id] = count;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          totalPolicies,
          activePolicies,
          totalClaims,
          totalPremiumCollected: totalPremium[0]?.total || 0,
          pendingClaims: statusCounts.SUBMITTED + statusCounts.UNDER_REVIEW,
          approvedClaims: statusCounts.APPROVED,
          rejectedClaims: statusCounts.REJECTED,
          investigationClaims: statusCounts.INVESTIGATION,
          settledClaims: statusCounts.SETTLED,
          highRiskClaims: riskCounts.HIGH,
        },
        claimsByStatus: statusCounts,
        riskDistribution: riskCounts,
        recentClaims,
        highRiskClaims,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/claims
const getAllClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find()
      .populate('customerId', 'name email phone')
      .populate('policyId', 'policyNumber vehicleMake vehicleModel vehicleYear coverageType premium')
      .populate('adjusterId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: claims });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/policies
const getAllPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find()
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: policies });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/payments
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('customerId', 'name email')
      .populate('policyId', 'policyNumber vehicleMake vehicleModel')
      .sort({ transactionDate: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getAllClaims, getAllPolicies, getAllUsers, getAllPayments };
