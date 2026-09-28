const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
    },
    // Vehicle details
    vehicleMake: { type: String, required: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    vehicleYear: { type: Number, required: true },
    vehicleValue: { type: Number, required: true, min: 0 },
    // Driver details
    driverAge: { type: Number, required: true, min: 18, max: 100 },
    previousClaims: { type: Number, default: 0, min: 0 },
    // Policy details
    location: { type: String, required: true, trim: true },
    coverageType: {
      type: String,
      enum: ['comprehensive', 'third_party'],
      required: true,
    },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    premium: { type: Number, required: true, min: 0 },
    // Premium breakdown stored for reference
    premiumBreakdown: {
      basePremium: Number,
      driverRiskAdjustment: Number,
      claimHistoryAdjustment: Number,
      vehicleAgeAdjustment: Number,
      coverageAdjustment: Number,
      locationRiskAdjustment: Number,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Auto-generate policy number
policySchema.pre('save', async function (next) {
  if (this.isNew && !this.policyNumber) {
    const count = await mongoose.model('Policy').countDocuments();
    this.policyNumber = `POL-${String(10001 + count).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Policy', policySchema);
