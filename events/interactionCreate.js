const { Events } = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Slash Command handler
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
      }
    }

    // Button Handler
    if (interaction.isButton()) {
      const { customId, guildId } = interaction;

      // Load scrim setup data if needed
      let setup = await ScrimSetup.findOne({ guildId });

      // If not exists, create default setup
      if (!setup) {
        setup = new ScrimSetup({ guildId });
        await setup.save();
      }

      // ✅ Main Panel Buttons
      switch (customId) {
        case 'create_scrim':
          require('../components/createScrimPanel')(interaction);
          return;

        case 'edit_settings':
          return interaction.reply({ content: '🛠️ Edit Settings coming soon.', ephemeral: true });

        case 'start_registration':
          return interaction.reply({ content: '🟢 Registration started!', ephemeral: true });

        case 'stop_registration':
          return interaction.reply({ content: '🔴 Registration stopped.', ephemeral: true });

        case 'view_slotlist':
          return interaction.reply({ content: '📃 Slotlist view coming soon.', ephemeral: true });

        case 'ban_user':
          return interaction.reply({ content: '🚫 Ban system coming soon.', ephemeral: true });

        case 'unban_user':
          return interaction.reply({ content: '✅ Unban system coming soon.', ephemeral: true });

        // ✅ Create Scrim A–H buttons (coming later)
        case 'conf_A':
        case 'conf_B':
        case 'conf_C':
        case 'conf_D':
        case 'conf_E':
        case 'conf_F':
        case 'conf_G':
        case 'conf_H':
          return interaction.reply({ content: `🔧 Setup option ${customId.slice(-1)} coming soon.`, ephemeral: true });

        case 'save_scrim':
          return interaction.reply({ content: '💾 Scrim saved!', ephemeral: true });

        case 'cancel_scrim':
          return interaction.reply({ content: '❌ Scrim setup cancelled.', ephemeral: true });
      }
    }
  }
};
