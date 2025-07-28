const mongoose = require('mongoose');

const scrimSetupSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true }, // Registration Channel
  mentionRoleId: { type: String },             // Mention Role (e.g., @BGMI)
  totalSlots: { type: Number, default: 25 },   // Total Slots
  tagCountRequired: { type: Number, default: 1 }, // How many team tags are required
  scrimDays: { type: [String], default: [] },     // e.g., ['Mon', 'Wed', 'Fri']
  openTime: { type: String },                  // Registration open time
  successRoleId: { type: String },             // Role given after successful registration
  reactionEmojis: { type: [String], default: [] }, // Custom emoji list
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScrimSetup', scrimSetupSchema);
