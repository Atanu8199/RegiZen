const mongoose = require('mongoose');

const scrimRegistrationSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  teamName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScrimRegistration', scrimRegistrationSchema);
