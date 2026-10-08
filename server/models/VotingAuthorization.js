const mongoose = require('mongoose');

const VotingAuthorizationSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true
    },
    voterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true
    },
    votedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index on pollId and voterEmail to strictly prevent duplicate authorization records
VotingAuthorizationSchema.index({ pollId: 1, voterEmail: 1 }, { unique: true });

module.exports = mongoose.model('VotingAuthorization', VotingAuthorizationSchema);
