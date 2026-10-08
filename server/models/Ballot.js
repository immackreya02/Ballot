const mongoose = require('mongoose');

const BallotSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Note: No voter identity (email/userId) is stored in Ballot to preserve voter choice privacy.

module.exports = mongoose.model('Ballot', BallotSchema);
