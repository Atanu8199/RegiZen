const mongoose = require('mongoose');

const ScrimSetupSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  registrationChannel: {
    type: String,
    default: null
  },
  mentionRole: {
    type: String,
    default: null
  },
  totalSlots: {
    type: Number,
    default: 25
  },
  tagCount: {
    type: Number,
    default: 1
  },
  scrimDays: {
    type: [String], // e.g., ['Monday', 'Wednesday']
    default: []
  },
  openTime: {
    type: String, // Format: '13:00' or '01:00 PM'
    default: null
  },
  successRole: {
    type: String,
    default: null
  },
  reactionEmojis: {
    type: [String], // e.g., ['✅', '🔥']
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScrimSetup', ScrimSetupSchema);
