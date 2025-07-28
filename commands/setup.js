// commands/setup.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  name: 'setup',
  description: 'Setup Scrims Panel',
  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎯 Scrim Admin Panel')
      .setDescription('Use the buttons below to create or manage your scrims.\n\nClick **Create Scrim** to begin setting up a new one.')
      .setColor('Green');

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_scrim')
        .setLabel('🟢 Create Scrim')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('edit_scrim')
        .setLabel('⚙️ Edit Settings')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('toggle_reg')
        .setLabel('🔄 Start/Stop Registration')
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('manage_slotlist')
        .setLabel('📂 Manage Slotlist')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('ban_unban')
        .setLabel('🚫 Ban/Unban')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('drop_location')
        .setLabel('🗺️ Drop Location')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('design_scrim')
        .setLabel('🎨 Design')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('scrim_help')
        .setLabel('❓ Help')
        .setStyle(ButtonStyle.Link)
        .setURL('https://yourbot.help') // Replace with your help/docs URL
    );

    await message.channel.send({
      content: `👋 <@${message.author.id}> opened the Scrim Admin Panel.`,
      embeds: [embed],
      components: [row1, row2]
    });
  }
};
