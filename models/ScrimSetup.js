const mongoose = require('mongoose');

const ScrimSetupSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },

  // Step A: Registration Channel
  registrationChannel: { type: String, default: null },

  // Step B: Mention Role
  mentionRole: { type: String, default: null },

  // Step C: Total Slots
  totalSlots: { type: Number, default: 25 },

  // Step D: Required Tags (number of team members that must tag)
  tagCount: { type: Number, default: 2 },

  // Step E: Scrim Days (array of strings like ['Monday', 'Wednesday'])
  scrimDays: { type: [String], default: [] },

  // Step F: Open Time (string or timestamp)
  openTime: { type: String, default: null },

  // Step G: Success Role to assign after register
  successRole: { type: String, default: null },

  // Step H: Reaction Emojis (optional, stored as array of emoji IDs or unicode)
  reactionEmojis: { type: [String], default: [] }
});

module.exports = mongoose.model('ScrimSetup', ScrimSetupSchema);
