const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['organizer', 'admin'],
      default: 'organizer'
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifyOTP: {
      type: String,
      default: null
    },
    emailVerifyExpiry: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);
