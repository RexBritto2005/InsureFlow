const Payment = require('../models/Payment');
const Policy = require('../models/Policy');

// POST /api/payments
const createPayment = async (req, res, next) => {
  try {
    const { policyId, amount, paymentMethod, description } = req.body;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    if (
      req.user.role === 'customer' &&
      policy.customerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be positive.' });
    }

    const payment = await Payment.create({
      policyId,
      customerId: policy.customerId,
      amount,
      paymentMethod: paymentMethod || 'net_banking',
      status: 'SUCCESS',
      description: description || `Payment for policy ${policy.policyNumber}`,
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments
const getPayments = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'customer' ? { customerId: req.user._id } : {};

    const payments = await Payment.find(filter)
      .populate('policyId', 'policyNumber vehicleMake vehicleModel')
      .populate('customerId', 'name email')
      .sort({ transactionDate: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPayment, getPayments };
