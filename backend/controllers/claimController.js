const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const { assessRisk } = require('../services/fraudEngine');

// POST /api/claims
const createClaim = async (req, res, next) => {
  try {
    const {
      policyId,
      accidentDate,
      accidentLocation,
      accidentType,
      description,
      estimatedDamage,
      imageUrl,
    } = req.body;

    // Validate policy belongs to customer
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }
    if (policy.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to file claim on this policy.' });
    }
    if (policy.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Claims can only be filed on active policies.' });
    }

    // Validate accident date is not in the future
    const accident = new Date(accidentDate);
    if (accident > new Date()) {
      return res.status(400).json({ success: false, message: 'Accident date cannot be in the future.' });
    }

    if (estimatedDamage <= 0) {
      return res.status(400).json({ success: false, message: 'Estimated damage must be positive.' });
    }

    // Run fraud/risk assessment
    const riskAssessment = assessRisk({
      claim: {
        accidentDate,
        estimatedDamage,
        accidentType,
      },
      policy,
    });

    // Determine initial status based on risk
    let initialStatus = 'SUBMITTED';
    if (riskAssessment.riskLevel === 'HIGH') {
      initialStatus = 'INVESTIGATION';
    }

    const claim = await Claim.create({
      policyId,
      customerId: req.user._id,
      accidentDate: accident,
      accidentLocation,
      accidentType,
      description,
      estimatedDamage,
      imageUrl,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskFactors: riskAssessment.riskFactors,
      status: initialStatus,
      statusHistory: [
        {
          status: 'SUBMITTED',
          changedBy: req.user._id,
          notes: 'Claim submitted by customer',
        },
        ...(riskAssessment.riskLevel === 'HIGH'
          ? [
              {
                status: 'INVESTIGATION',
                changedBy: req.user._id,
                notes: 'Automatically flagged for investigation due to high risk score',
              },
            ]
          : []),
      ],
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('policyId')
      .populate('customerId', 'name email phone');

    res.status(201).json({ success: true, data: populatedClaim });
  } catch (error) {
    next(error);
  }
};

// GET /api/claims
const getClaims = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'customer') {
      filter = { customerId: req.user._id };
    } else if (req.user.role === 'adjuster') {
      // Adjusters see submitted and under_review claims
      filter = {};
    }

    const claims = await Claim.find(filter)
      .populate('policyId', 'policyNumber vehicleMake vehicleModel vehicleYear coverageType premium')
      .populate('customerId', 'name email phone')
      .populate('adjusterId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: claims });
  } catch (error) {
    next(error);
  }
};

// GET /api/claims/:id
const getClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('policyId')
      .populate('customerId', 'name email phone')
      .populate('adjusterId', 'name email')
      .populate('statusHistory.changedBy', 'name role');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    if (
      req.user.role === 'customer' &&
      claim.customerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

// PUT /api/claims/:id/status
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, notes, settlementAmount, rejectionReason } = req.body;

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    const validTransitions = {
      SUBMITTED: ['UNDER_REVIEW', 'INVESTIGATION'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED', 'INVESTIGATION'],
      INVESTIGATION: ['APPROVED', 'REJECTED', 'UNDER_REVIEW'],
      APPROVED: ['SETTLED'],
      REJECTED: [],
      SETTLED: [],
    };

    if (!validTransitions[claim.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition claim from ${claim.status} to ${status}.`,
      });
    }

    claim.status = status;
    claim.adjusterId = req.user._id;

    if (status === 'SETTLED' && settlementAmount) {
      claim.settlementAmount = settlementAmount;
    }
    if (status === 'REJECTED' && rejectionReason) {
      claim.rejectionReason = rejectionReason;
    }
    if (notes) {
      claim.adjusterNotes = notes;
    }

    claim.statusHistory.push({
      status,
      changedBy: req.user._id,
      notes: notes || `Status updated to ${status}`,
    });

    await claim.save();

    const updatedClaim = await Claim.findById(claim._id)
      .populate('policyId')
      .populate('customerId', 'name email phone')
      .populate('adjusterId', 'name email')
      .populate('statusHistory.changedBy', 'name role');

    res.json({ success: true, data: updatedClaim });
  } catch (error) {
    next(error);
  }
};

module.exports = { createClaim, getClaims, getClaim, updateClaimStatus };
