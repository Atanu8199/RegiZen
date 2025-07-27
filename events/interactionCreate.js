module.exports = async (interaction, client) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error occurred.', ephemeral: true });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'create_scrim') {
      return interaction.reply({ content: '📋 Scrim creation form coming soon!', ephemeral: true });
    }

    if (interaction.customId === 'edit_scrim') {
      return interaction.reply({ content: '✏️ Edit form coming soon!', ephemeral: true });
    }

    if (interaction.customId === 'toggle_reg') {
      return interaction.reply({ content: '🛑 Registration toggled (mock).', ephemeral: true });
    }
  }
};
