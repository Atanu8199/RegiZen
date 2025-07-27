const mongoose = require('mongoose');

const scrimSetupSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  regChannel: {
    type: String,
    default: null
  },
  slotlistChannel: {
    type: String,
    default: null
  },
  successRole: {
    type: String,
    default: null
  },
  mentionsRequired: {
    type: Number,
    default: 4
  },
  totalSlots: {
    type: Number,
    default: null
  },
  openTime: {
    type: String,
    default: null
  },
  scrimDays: {
    type: [String],
    default: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  },
  reactions: {
    type: [String],
    default: ['✅', '❌']
  },
  messageId: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('ScrimSetup', scrimSetupSchema);
