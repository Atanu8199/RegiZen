const mongoose = require('mongoose');

const scrimSetupSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  registrationChannel: {
    type: String,
    default: null // Channel ID
  },
  mentionRole: {
    type: String,
    default: null // Role ID
  },
  totalSlots: {
    type: Number,
    default: 25
  },
  tagCount: {
    type: Number,
    default: 4
  },
  scrimDays: {
    type: [String],
    default: [] // ['Monday', 'Tuesday', ...]
  },
  openTime: {
    type: String,
    default: null // e.g., "1:00 PM"
  },
  successRole: {
    type: String,
    default: null // Role ID
  },
  // Step H (to be added): emojis or other future settings can be added here
}, { timestamps: true });

module.exports = mongoose.model('ScrimSetup', scrimSetupSchema);
