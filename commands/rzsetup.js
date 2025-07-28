const {
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  name: 'rzsetup',
  description: 'Start the Scrim Setup Panel',

  async execute(message, args, client) {
    // Step 1: Permission Check (admin or role)
    const allowedRoles = ['T3 Scrims Manager', 'Admin'];
    const memberRoles = message.member.roles.cache.map(r => r.name);
    const hasPermission =
      message.member.permissions.has(PermissionFlagsBits.Administrator) ||
      memberRoles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      return message.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    // Step 2: Embed + Button
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Scrim Setup Panel')
      .setDescription('Click the button below to access scrim configuration tools.')
      .setColor('#00b0f4')
      .setFooter({ text: 'RegiZen Bot • Scrim Management' });

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup_scrims')
        .setLabel('Setup Scrims')
        .setStyle(ButtonStyle.Success)
    );

    // Step 3: Send response
    await message.channel.send({
      embeds: [embed],
      components: [button]
    });
  }
};
