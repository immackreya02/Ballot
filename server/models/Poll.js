const mongoose = require('mongoose');

const PollOptionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true,
    trim: true
  },
  voteCount: {
    type: Number,
    default: 0
  }
});

const PollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    pollCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizerName: {
      type: String,
      default: ''
    },
    options: [PollOptionSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'OPEN', 'CLOSED', 'ARCHIVED'],
      default: 'DRAFT'
    },
    resultVisibility: {
      type: String,
      enum: ['LIVE', 'AFTER_VOTE', 'AFTER_CLOSE'],
      default: 'LIVE'
    },
    startAt: {
      type: Date,
      default: null
    },
    endAt: {
      type: Date,
      default: null
    },
    electorateSourceType: {
      type: String,
      enum: ['SPECIFIC', 'GROUP'],
      default: 'SPECIFIC'
    },
    voterGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VoterGroup',
      default: null
    },
    totalEligibleCount: {
      type: Number,
      default: 0
    },
    lockedElectorate: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Poll', PollSchema);
