const mongoose = require('mongoose');

const AuditEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true
    },
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      default: null,
      index: true
    },
    actorEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    ip: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: 'BALLOT-App'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditEvent', AuditEventSchema);
