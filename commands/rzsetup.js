const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'rzsetup',
  description: 'Start the Scrim Setup Panel',

  async execute(message, args, client) {
    // Check if user has admin or scrim manager role
    const allowedRoles = ['T3 Scrims Manager', 'Admin'];
    const memberRoles = message.member.roles.cache.map(r => r.name);
    const hasPermission = message.member.permissions.has(PermissionFlagsBits.Administrator) ||
      memberRoles.some(r => allowedRoles.includes(r));

    if (!hasPermission) {
      return message.reply('❌ You don\'t have permission to use this command.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🔧 Scrim Setup Panel')
      .setDescription('Click the button below to begin setting up scrims.')
      .setColor('#00b0f4');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup_scrims')
        .setLabel('Setup Scrims')
        .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  },
};
