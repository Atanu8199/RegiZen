const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the scrim management panel'),

  async execute(interaction) {
    try {
      console.log('✅ Setup command invoked'); // 🧪 DEBUG LOG

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

      console.log('✅ Buttons created'); // 🧪 DEBUG LOG

      await interaction.reply({
        content: '🛠️ **Scrim Control Panel**',
        components: [row],
        ephemeral: true
      });

      console.log('✅ Interaction reply sent'); // 🧪 DEBUG LOG

    } catch (err) {
      console.log('❌ ERROR caught inside setup.js execute block');
      console.error(err); // Make sure error shows

      try {
        await interaction.reply({
          content: '❌ Error while executing the setup command.',
          ephemeral: true
        });
      } catch (err2) {
        console.log('❌ Failed to reply with error');
        console.error(err2);
      }
    }
  }
};
