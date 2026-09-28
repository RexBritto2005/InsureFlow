const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
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
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'wallet'],
      default: 'net_banking',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'],
      default: 'SUCCESS',
    },
    transactionDate: { type: Date, default: Date.now },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate payment number
paymentSchema.pre('save', async function (next) {
  if (this.isNew && !this.paymentNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentNumber = `PAY-${String(10001 + count).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
