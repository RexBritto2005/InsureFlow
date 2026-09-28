const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      unique: true,
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adjusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Accident details
    accidentDate: { type: Date, required: true },
    accidentLocation: { type: String, required: true, trim: true },
    accidentType: {
      type: String,
      enum: ['collision', 'theft', 'vandalism', 'natural_disaster', 'fire', 'other'],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    estimatedDamage: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    // Risk assessment
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    riskFactors: [{ type: String }],
    // Status and decision
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION', 'APPROVED', 'REJECTED', 'SETTLED'],
      default: 'SUBMITTED',
    },
    adjusterNotes: { type: String, trim: true },
    settlementAmount: { type: Number, min: 0 },
    rejectionReason: { type: String, trim: true },
    // Timeline
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate claim number
claimSchema.pre('save', async function (next) {
  if (this.isNew && !this.claimNumber) {
    const count = await mongoose.model('Claim').countDocuments();
    this.claimNumber = `CLM-${String(10001 + count).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Claim', claimSchema);
