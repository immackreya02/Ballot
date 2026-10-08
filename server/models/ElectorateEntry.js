const mongoose = require('mongoose');

const ElectorateEntrySchema = new mongoose.Schema(
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
      trim: true
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Ensure unique voter email per poll
ElectorateEntrySchema.index({ pollId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('ElectorateEntry', ElectorateEntrySchema);
