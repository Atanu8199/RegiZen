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
  teamName: {
    type: String,
    required: true
  },
  players: {
    type: [String], // Discord tags or IDs (e.g., ["<@123>", "<@456>", ...])
    required: true
  },
  registeredBy: {
    type: String, // Discord ID of the person who registered
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScrimRegistration', scrimRegistrationSchema);
