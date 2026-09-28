const Quote = require('../models/Quote');
const { calculatePremium } = require('../services/premiumEngine');

// POST /api/quotes
const createQuote = async (req, res, next) => {
  try {
    const {
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleValue,
      driverAge,
      driverName,
      previousClaims,
      location,
      coverageType,
    } = req.body;

    // Validation
    const currentYear = new Date().getFullYear();
    if (vehicleYear < 1980 || vehicleYear > currentYear + 1) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle year.' });
    }
    if (vehicleValue <= 0) {
      return res.status(400).json({ success: false, message: 'Vehicle value must be positive.' });
    }
    if (driverAge < 18 || driverAge > 100) {
      return res.status(400).json({ success: false, message: 'Driver age must be between 18 and 100.' });
    }

    const premiumResult = calculatePremium({
      vehicleValue,
      driverAge,
      vehicleYear,
      previousClaims: previousClaims || 0,
      coverageType,
      location,
    });

    const quote = await Quote.create({
      customerId: req.user._id,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleValue,
      driverAge,
      driverName,
      previousClaims: previousClaims || 0,
      location,
      coverageType,
      basePremium: premiumResult.basePremium,
      driverRiskAdjustment: premiumResult.driverRiskAdjustment,
      claimHistoryAdjustment: premiumResult.claimHistoryAdjustment,
      vehicleAgeAdjustment: premiumResult.vehicleAgeAdjustment,
      coverageAdjustment: premiumResult.coverageAdjustment,
      locationRiskAdjustment: premiumResult.locationRiskAdjustment,
      finalPremium: premiumResult.finalPremium,
    });

    res.status(201).json({
      success: true,
      data: { quote, breakdown: premiumResult.breakdown },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/quotes
const getQuotes = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'customer'
        ? { customerId: req.user._id }
        : req.user.role === 'agent'
        ? {}
        : {};

    const quotes = await Quote.find(filter)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: quotes });
  } catch (error) {
    next(error);
  }
};

// GET /api/quotes/:id
const getQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('customerId', 'name email');

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found.' });
    }

    // Customer can only see their own quotes
    if (
      req.user.role === 'customer' &&
      quote.customerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuote, getQuotes, getQuote };
