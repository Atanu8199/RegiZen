const ScrimSetup = require('../models/ScrimSetup');
const ScrimRegistration = require('../models/ScrimRegistration');

module.exports = async (message, client) => {
  if (message.author.bot || !message.guild) return;

  const setup = await ScrimSetup.findOne({ guildId: message.guild.id });
  if (!setup) return;

  const currentChannelId = message.channel.id;
  if (!setup.registrationChannel || setup.registrationChannel !== currentChannelId) return;

  const content = message.content.trim();

  const teamNameMatch = content.match(/Team\\s+Name\\s*[-:]\\s*(.+)/i) || content.match(/^Team\\s+(.+)/i);
  const mentionMatches = content.match(/<@!?\\d+>/g) || content.match(/@\\w+/g);

  if (!teamNameMatch || !mentionMatches || mentionMatches.length < 4) {
    return message.reply({
      content: '❌ Invalid format. Make sure to include `Team Name` and at least 4 valid Discord tags.',
      allowedMentions: { repliedUser: false }
    });
  }

  const teamName = teamNameMatch[1].trim();

  // Check if this user or team already registered in this channel
  const existing = await ScrimRegistration.findOne({
    guildId: message.guild.id,
    channelId: currentChannelId,
    $or: [
      { teamName: { $regex: new RegExp(`^${teamName}$`, 'i') } },
      { players: { $in: [message.author.id] } }
    ]
  });

  if (existing) {
    return message.reply({
      content: '⚠️ You or your team has already registered for this scrim.',
      allowedMentions: { repliedUser: false }
    });
  }

  const teamData = {
    guildId: message.guild.id,
    channelId: currentChannelId,
    teamName,
    players: mentionMatches.map(tag => tag),
    registeredBy: message.author.id,
    registeredAt: new Date()
  };

  await ScrimRegistration.create(teamData);

  return message.reply({
    content: `✅ **${teamName}** has been successfully registered!`,
    allowedMentions: { repliedUser: false }
  });
};
