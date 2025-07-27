const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const createScrimPanel = require('../components/createScrimPanel');
const fs = require('fs');
const path = require('path');

const scrimData = {}; // Per-user temporary data

module.exports = async (interaction, client) => {
  if (interaction.isButton()) {
    const id = interaction.customId;

    // Start Panel
    if (id === 'create_scrim') {
      const { embed, components } = createScrimPanel();
      await interaction.reply({ embeds: [embed], components, ephemeral: true });
    }

    // Open Modal for A (Reg. Channel)
    if (id === 'set_a') {
      const modal = new ModalBuilder()
        .setCustomId('modal_set_a')
        .setTitle('Set Registration Channel');

      const input = new TextInputBuilder()
        .setCustomId('reg_channel')
        .setLabel('Enter channel ID or mention')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('#registration or ID');

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }

    // More buttons (B–H) can be handled here similarly...

    if (id === 'save_scrim') {
      const userId = interaction.user.id;
      const data = scrimData[userId];

      if (!data) {
        return interaction.reply({ content: '❌ No scrim data found. Please set values first.', ephemeral: true });
      }

      // Save to scrims.json
      const filePath = path.join(__dirname, '../data/scrims.json');
      let existing = [];

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        existing = JSON.parse(content || '[]');
      }

      existing.push(data);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

      await interaction.reply({ content: '✅ Scrim saved successfully!', ephemeral: true });
    }

    if (id === 'cancel_scrim') {
      delete scrimData[interaction.user.id];
      await interaction.reply({ content: '❌ Scrim creation canceled.', ephemeral: true });
    }

  } else if (interaction.isModalSubmit()) {
    const userId = interaction.user.id;

    // Modal for Reg. Channel (A)
    if (interaction.customId === 'modal_set_a') {
      const value = interaction.fields.getTextInputValue('reg_channel');
      scrimData[userId] = scrimData[userId] || {};
      scrimData[userId].regChannel = value;

      const { embed, components } = createScrimPanel(scrimData[userId]);
      await interaction.reply({ content: '✅ Updated Reg. Channel.', embeds: [embed], components, ephemeral: true });
    }

    // Add other modalSubmit handlers here (modal_set_b, modal_set_c, etc.)
  }
};
