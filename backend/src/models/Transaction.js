const mongoose = require('mongoose');

const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

const CATEGORIES = [
  'salary',
  'freelance',
  'investment',
  'business',
  'rent',
  'utilities',
  'groceries',
  'transport',
  'healthcare',
  'entertainment',
  'education',
  'insurance',
  'taxes',
  'other',
];

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      select: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ createdBy: 1, date: -1 });
transactionSchema.index({ isDeleted: 1 });

transactionSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) return next();
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction, TRANSACTION_TYPES, CATEGORIES };
