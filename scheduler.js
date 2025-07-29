const ScrimSetup = require('./models/ScrimSetup');
const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = async (client) => {
  setInterval(async () => {
    const now = new Date();
    const allSetups = await ScrimSetup.find();

    for (const setup of allSetups) {
      if (!setup.registrationOpenTime || !setup.registrationChannel) continue;

      const regTime = new Date(setup.registrationOpenTime);
      const diff = Math.abs(now - regTime);

      // Allow a 60-second window
      if (diff < 60000 && !setup.registrationOpened) {
        const guild = client.guilds.cache.get(setup.guildId);
        if (!guild) continue;

        const regChannel = guild.channels.cache.get(setup.registrationChannel);
        if (!regChannel || regChannel.type !== ChannelType.GuildText) continue;

        try {
          // Unlock the registration channel (allow Send Messages)
          await regChannel.permissionOverwrites.edit(guild.roles.everyone, {
            SendMessages: true
          });

          await regChannel.send('✅ **Registration is now OPEN!**\nPlease submit your team details in the required format.');

          // Optional: log to rz-logs
          const logChannel = guild.channels.cache.find(c => c.name === 'rz-logs');
          if (logChannel) {
            await logChannel.send(`🟢 Registration channel <#${regChannel.id}> is now open.`);
          }

          // Mark as opened (to prevent duplicate triggers)
          setup.registrationOpened = true;
          await setup.save();
        } catch (err) {
          console.error(`Error opening channel for guild ${setup.guildId}:`, err);
        }
      }
    }
  }, 60000); // Runs every 60 seconds
};
