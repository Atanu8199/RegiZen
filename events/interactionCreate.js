const fs = require('fs');
const path = require('path');
const createScrimModal = require('../components/createScrimModal');

module.exports = async (interaction, client) => {
  if (interaction.isButton()) {
    // Handle "Create Scrim" button
    if (interaction.customId === 'create_scrim') {
      const modal = createScrimModal();
      return await interaction.showModal(modal);
    }

    // TODO: handle other buttons later...
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'create_scrim_modal') {
      const regChannel = interaction.fields.getTextInputValue('reg_channel');
      const mentionRole = interaction.fields.getTextInputValue('mention_role');
      const totalSlots = interaction.fields.getTextInputValue('total_slots');
      const teamTags = interaction.fields.getTextInputValue('team_tags');
      const regTime = interaction.fields.getTextInputValue('reg_time');

      // Build scrim config object
      const scrimData = {
        createdBy: interaction.user.id,
        registrationChannel: regChannel,
        mentionRole: mentionRole,
        totalSlots: parseInt(totalSlots),
        requiredTags: parseInt(teamTags),
        registrationTime: regTime,
        createdAt: new Date().toISOString()
      };

      // Save to JSON
      const dataPath = path.join(__dirname, '..', 'data', 'scrims.json');
      let scrimList = [];

      if (fs.existsSync(dataPath)) {
        scrimList = JSON.parse(fs.readFileSync(dataPath));
      }

      scrimList.push(scrimData);
      fs.writeFileSync(dataPath, JSON.stringify(scrimList, null, 2));

      return await interaction.reply({
        content: `✅ Scrim created successfully for <#${regChannel}> with ${totalSlots} slots.`,
        ephemeral: true
      });
    }
  }
};
