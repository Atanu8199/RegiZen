// models/ScrimSetup.js

const mongoose = require('mongoose');

const ScrimSetupSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  registrationChannel: {
    type: String,
    default: null,
  },
  mentionRole: {
    type: String,
    default: null,
  },
  totalSlots: {
    type: Number,
    default: 25,
  },
  tagCount: {
    type: Number,
    default: 2,
  },
  scrimDays: {
    type: [String],
    default: [],
  },
  openTime: {
    type: String,
    default: null,
  },
  successRole: {
    type: String,
    default: null,
  },
  reactionEmojis: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('ScrimSetup', ScrimSetupSchema);
