const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the scrim management panel'),

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_scrim')
        .setLabel('Create Scrim')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('edit_scrim')
        .setLabel('Edit Settings')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('toggle_reg')
        .setLabel('Start/Stop Registration')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: '🛠️ **Scrim Control Panel**',
      components: [row],
      ephemeral: true
    });
  }
};
