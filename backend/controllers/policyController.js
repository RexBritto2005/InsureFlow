const Policy = require('../models/Policy');
const Quote = require('../models/Quote');
const Payment = require('../models/Payment');
const { calculatePremium } = require('../services/premiumEngine');

// POST /api/policies
const createPolicy = async (req, res, next) => {
  try {
    const {
      quoteId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleValue,
      driverAge,
      previousClaims,
      location,
      coverageType,
      startDate,
    } = req.body;

    let premiumData;
    let quoteRef = null;
    let quoteData = null;

    if (quoteId) {
      const quote = await Quote.findById(quoteId);
      if (!quote) {
        return res.status(404).json({ success: false, message: 'Quote not found.' });
      }
      if (quote.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      quoteData = quote;
      premiumData = {
        basePremium: quote.basePremium,
        driverRiskAdjustment: quote.driverRiskAdjustment,
        claimHistoryAdjustment: quote.claimHistoryAdjustment,
        vehicleAgeAdjustment: quote.vehicleAgeAdjustment,
        coverageAdjustment: quote.coverageAdjustment,
        locationRiskAdjustment: quote.locationRiskAdjustment,
        finalPremium: quote.finalPremium,
      };
      quoteRef = quoteId;
      quote.status = 'converted';
      await quote.save();
    } else {
      premiumData = calculatePremium({
        vehicleValue,
        driverAge,
        vehicleYear,
        previousClaims: previousClaims || 0,
        coverageType,
        location,
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const expiry = new Date(start);
    expiry.setFullYear(expiry.getFullYear() + 1);

    const policy = await Policy.create({
      customerId: req.user._id,
      quoteId: quoteRef,
      vehicleMake: vehicleMake || (quoteData ? quoteData.vehicleMake : ''),
      vehicleModel: vehicleModel || (quoteData ? quoteData.vehicleModel : ''),
      vehicleYear: vehicleYear || (quoteData ? quoteData.vehicleYear : 0),
      vehicleValue: vehicleValue || (quoteData ? quoteData.vehicleValue : 0),
      driverAge: driverAge || (quoteData ? quoteData.driverAge : 0),
      previousClaims: previousClaims !== undefined ? previousClaims : (quoteData ? quoteData.previousClaims : 0),
      location: location || (quoteData ? quoteData.location : ''),
      coverageType: coverageType || (quoteData ? quoteData.coverageType : 'third_party'),
      startDate: start,
      expiryDate: expiry,
      premium: premiumData.finalPremium,
      premiumBreakdown: {
        basePremium: premiumData.basePremium,
        driverRiskAdjustment: premiumData.driverRiskAdjustment,
        claimHistoryAdjustment: premiumData.claimHistoryAdjustment,
        vehicleAgeAdjustment: premiumData.vehicleAgeAdjustment,
        coverageAdjustment: premiumData.coverageAdjustment,
        locationRiskAdjustment: premiumData.locationRiskAdjustment,
      },
      status: 'active',
    });

    // Create initial premium payment record
    await Payment.create({
      policyId: policy._id,
      customerId: req.user._id,
      amount: premiumData.finalPremium,
      paymentMethod: req.body.paymentMethod || 'net_banking',
      status: 'SUCCESS',
      description: `Premium payment for policy ${policy.policyNumber}`,
    });

    const populatedPolicy = await Policy.findById(policy._id).populate('customerId', 'name email');

    res.status(201).json({ success: true, data: populatedPolicy });
  } catch (error) {
    next(error);
  }
};

// GET /api/policies
const getPolicies = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'customer' ? { customerId: req.user._id } : {};

    const policies = await Policy.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: policies });
  } catch (error) {
    next(error);
  }
};

// GET /api/policies/:id
const getPolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id).populate(
      'customerId',
      'name email phone'
    );

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    if (
      req.user.role === 'customer' &&
      policy.customerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

// PUT /api/policies/:id
const updatePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    const allowedUpdates = ['status'];
    const updates = {};
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email phone');

    res.json({ success: true, data: updatedPolicy });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPolicy, getPolicies, getPolicy, updatePolicy };
