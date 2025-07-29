const ScrimSetup = require('./models/ScrimSetup');
const { ChannelType, PermissionsBitField } = require('discord.js');
const moment = require('moment'); // ⏰ Ensure installed: `npm i moment`

module.exports = async (client) => {
  setInterval(async () => {
    const now = moment().format('HH:mm'); // '14:30' style
    const allSetups = await ScrimSetup.find();

    for (const setup of allSetups) {
      if (!setup.registrationOpenTime || !setup.registrationChannel) continue;

      // Compare time as string
      if (setup.registrationOpenTime === now && !setup.registrationOpened) {
        const guild = client.guilds.cache.get(setup.guildId);
        if (!guild) continue;

        const regChannel = guild.channels.cache.get(setup.registrationChannel);
        if (!regChannel || regChannel.type !== ChannelType.GuildText) continue;

        try {
          // Unlock the registration channel
          await regChannel.permissionOverwrites.edit(guild.roles.everyone, {
            SendMessages: true
          });

          await regChannel.send('✅ **Registration is now OPEN!**\nPlease submit your team details in the required format.');

          // Log to rz-logs channel
          const logChannel = guild.channels.cache.find(c => c.name === 'rz-logs');
          if (logChannel) {
            await logChannel.send(`🟢 Registration channel <#${regChannel.id}> is now open.`);
          }

          // Mark as opened
          setup.registrationOpened = true;
          await setup.save();
        } catch (err) {
          console.error(`Error opening registration for guild ${setup.guildId}:`, err);
        }
      }
    }
  }, 60 * 1000); // Every 1 minute
};
