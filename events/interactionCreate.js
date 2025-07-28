const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

  const { guildId, customId } = interaction;
  let setup = await ScrimSetup.findOne({ guildId }) || new ScrimSetup({ guildId });

  // Debug log
  console.log("Interaction Triggered:", customId);

  // 📌 Setup Scrim Main Panel
  if (customId === 'setup_scrims') {
    const embed = new EmbedBuilder()
      .setTitle('📋 Create Scrim Configuration')
      .setDescription(`Click the buttons below to configure your scrim:\n\nA️⃣ Registration Channel\nB️⃣ Mention Role\nC️⃣ Total Slots\nD️⃣ Tag Count\nE️⃣ Scrim Day(s)\nF️⃣ Open Time\nG️⃣ Success Role\nH️⃣ Reaction Emojis`)
      .setFooter({ text: 'RegiZen • Scrim Setup' })
      .setColor('#00b0f4');

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('conf_A').setLabel('A️⃣ Registration Channel').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('conf_B').setLabel('B️⃣ Mention Role').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('conf_C').setLabel('C️⃣ Total Slots').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('conf_D').setLabel('D️⃣ Tag Count').setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('conf_E').setLabel('E️⃣ Scrim Day(s)').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('conf_F').setLabel('F️⃣ Open Time').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('conf_G').setLabel('G️⃣ Success Role').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('conf_H').setLabel('H️⃣ Reaction Emojis').setStyle(ButtonStyle.Primary)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row1, row2],
      ephemeral: true // ⚠️ will show warning in console, safe to ignore
    });
  }

  // ✅ A: Select Registration Channel
  if (customId === 'conf_A') {
    const options = interaction.guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({ label: `#${c.name}`, value: c.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '📥 Select a registration channel:',
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents({
          type: 3,
          custom_id: 'select_reg_channel',
          placeholder: 'Choose a channel...',
          options
        })
      ]
    });
  }

  if (customId === 'select_reg_channel' && interaction.isSelectMenu()) {
    const selectedChannelId = interaction.values[0];
    setup.registrationChannel = selectedChannelId;
    await setup.save();

    return interaction.update({
      content: `✅ Registration channel set to <#${selectedChannelId}>.`,
      components: []
    });
  }

  // ✅ B: Mention Role Select
  if (customId === 'conf_B') {
    const options = interaction.guild.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => ({
        label: role.name,
        value: role.id
      }))
      .slice(0, 25);

    return interaction.reply({
      content: '🔔 Select a mention role:',
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents({
          type: 3,
          custom_id: 'select_mention_role',
          placeholder: 'Choose a role...',
          options
        })
      ]
    });
  }

  if (customId === 'select_mention_role' && interaction.isSelectMenu()) {
    const roleId = interaction.values[0];
    setup.mentionRole = roleId;
    await setup.save();

    return interaction.update({
      content: `✅ Mention role set to <@&${roleId}>.`,
      components: []
    });
  }

  // ✅ C: Total Slots
  if (customId === 'conf_C') {
    const modal = new ModalBuilder()
      .setCustomId('set_total_slots')
      .setTitle('C️⃣ Set Total Slots');

    const slotInput = new TextInputBuilder()
      .setCustomId('total_slots_input')
      .setLabel('Enter total number of slots (1–25)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(2);

    const row = new ActionRowBuilder().addComponents(slotInput);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && customId === 'set_total_slots') {
    const input = interaction.fields.getTextInputValue('total_slots_input');
    const slots = parseInt(input);

    if (isNaN(slots) || slots < 1 || slots > 25) {
      return interaction.reply({
        content: '❌ Please enter a valid number between 1 and 25.',
        ephemeral: true
      });
    }

    setup.totalSlots = slots;
    await setup.save();

    return interaction.reply({
      content: `✅ Total slots set to **${slots}**.`,
      ephemeral: true
    });
  }
};
