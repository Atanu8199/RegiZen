const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    // When "Setup Scrims" button is clicked
    if (customId === 'setup_scrims') {
      const panelEmbed = new EmbedBuilder()
        .setTitle('🎮 RegiZen Scrim Admin Panel')
        .setDescription('Use the buttons below to manage scrims for your server.')
        .setColor('#0da2ff');

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('create_scrim').setLabel('🟢 Create Scrim').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('edit_settings').setLabel('🟣 Edit Settings').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('start_stop').setLabel('✅ Start/Stop Registration').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('reserve_slots').setLabel('📌 Reserve Slots').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ban_unban').setLabel('🚫 Ban/Unban').setStyle(ButtonStyle.Danger)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('design').setLabel('🎨 Design').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('manage_slotlist').setLabel('🗂️ Manage Slotlist').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('enable_disable').setLabel('🔄 Enable/Disable').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('need_help').setLabel('❓ Need Help').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('drop_location_panel').setLabel('🗺️ Drop Location Panel').setStyle(ButtonStyle.Secondary)
      );

      const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('premium').setLabel('🪙 Free Premium').setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({
        embeds: [panelEmbed],
        components: [row1, row2, row3],
        ephemeral: true
      });
    }
  }
};
