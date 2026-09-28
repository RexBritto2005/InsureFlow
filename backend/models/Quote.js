const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
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
    // Vehicle details
    vehicleMake: { type: String, required: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    vehicleYear: { type: Number, required: true },
    vehicleValue: { type: Number, required: true, min: 0 },
    // Driver details
    driverAge: { type: Number, required: true, min: 18, max: 100 },
    driverName: { type: String, trim: true },
    previousClaims: { type: Number, default: 0, min: 0 },
    // Location & Coverage
    location: { type: String, required: true, trim: true },
    coverageType: {
      type: String,
      enum: ['comprehensive', 'third_party'],
      required: true,
    },
    // Premium breakdown
    basePremium: { type: Number, required: true },
    driverRiskAdjustment: { type: Number, default: 0 },
    claimHistoryAdjustment: { type: Number, default: 0 },
    vehicleAgeAdjustment: { type: Number, default: 0 },
    coverageAdjustment: { type: Number, default: 0 },
    locationRiskAdjustment: { type: Number, default: 0 },
    finalPremium: { type: Number, required: true },
    // Status
    status: {
      type: String,
      enum: ['active', 'converted', 'expired'],
      default: 'active',
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

// Auto-generate quote number
quoteSchema.pre('save', async function (next) {
  if (this.isNew && !this.quoteNumber) {
    const count = await mongoose.model('Quote').countDocuments();
    this.quoteNumber = `QT-${String(10001 + count).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Quote', quoteSchema);
