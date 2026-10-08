const mongoose = require('mongoose');

const OTPVerificationSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    resendCount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Automatic TTL expiration
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('OTPVerification', OTPVerificationSchema);
