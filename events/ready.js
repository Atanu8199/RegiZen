const { Events, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    // Loop through each guild and ensure #rz-logs exists
    client.guilds.cache.forEach(async (guild) => {
      try {
        const existing = guild.channels.cache.find(
          ch => ch.name === 'rz-logs' && ch.type === ChannelType.GuildText
        );

        if (!existing) {
          const created = await guild.channels.create({
            name: 'rz-logs',
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.SendMessages],
              },
            ],
          });
          console.log(`📁 Created #rz-logs in ${guild.name}`);
        }
      } catch (err) {
        console.error(`❌ Error creating #rz-logs in ${guild.name}:`, err);
      }
    });
  },
};
