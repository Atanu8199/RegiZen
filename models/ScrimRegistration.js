const mongoose = require('mongoose');

const scrimRegistrationSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true // The user who submitted the form
  },
  teamName: {
    type: String,
    required: true
  },
  discordTags: {
    type: [String], // Array of 4 Discord tags (e.g., ["<@123>", "<@456>", ...])
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 4 players']
  },
  slotNumber: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model('ScrimRegistration', scrimRegistrationSchema);
