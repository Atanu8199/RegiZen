const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  RoleSelectMenuBuilder
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

  const { guildId, customId } = interaction;
  console.log("Interaction:", customId);

  let setup = await ScrimSetup.findOne({ guildId }) || new ScrimSetup({ guildId });

  // 📋 Main Configuration Panel
  if (customId === 'setup_scrims') {
    const embed = new EmbedBuilder()
      .setTitle('📋 Create Scrim Configuration')
      .setDescription(`Click the buttons below to configure your scrim.\n\nA️⃣ Registration Channel\nB️⃣ Mention Role\nC️⃣ Total Slots\nD️⃣ Tag Count Required\nE️⃣ Scrim Day(s)\nF️⃣ Open Time\nG️⃣ Success Role\nH️⃣ Reaction Emojis`)
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
      flags: 64 // ephemeral true
    });
  }

  // A️⃣ Registration Channel
  if (customId === 'conf_A') {
    const options = interaction.guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({ label: `#${c.name}`, value: c.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '📥 Select a registration channel:',
      flags: 64,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_reg_channel',
              placeholder: 'Choose a channel...',
              options
            }
          ]
        }
      ]
    });
  }

  if (interaction.isSelectMenu() && customId === 'select_reg_channel') {
    const selectedChannelId = interaction.values[0];
    setup.registrationChannel = selectedChannelId;
    await setup.save();

    return interaction.update({
      content: `✅ Registration channel set to <#${selectedChannelId}>.`,
      components: []
    });
  }

  // B️⃣ Mention Role
  if (customId === 'conf_B') {
    const row = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('select_mention_role')
        .setPlaceholder('Select a role to mention')
        .setMinValues(1)
        .setMaxValues(1)
    );

    return interaction.reply({
      content: '📢 Select a role to mention:',
      components: [row],
      flags: 64
    });
  }

  if (interaction.isSelectMenu() && customId === 'select_mention_role') {
    const roleId = interaction.values[0];
    setup.mentionRole = roleId;
    await setup.save();

    return interaction.update({
      content: `✅ Mention role set to <@&${roleId}>.`,
      components: []
    });
  }

  // C️⃣ Total Slots
  if (customId === 'conf_C') {
    const modal = new ModalBuilder()
      .setCustomId('modal_total_slots')
      .setTitle('Set Total Slots');

    const input = new TextInputBuilder()
      .setCustomId('total_slots_input')
      .setLabel('Enter total number of slots (Max 25)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && customId === 'modal_total_slots') {
    const slots = parseInt(interaction.fields.getTextInputValue('total_slots_input'));

    if (isNaN(slots) || slots < 1 || slots > 25) {
      return interaction.reply({
        content: '❌ Invalid slot number. Please enter a number between 1 and 25.',
        flags: 64
      });
    }

    setup.totalSlots = slots;
    await setup.save();

    return interaction.reply({
      content: `✅ Total slots set to **${slots}**.`,
      flags: 64
    });
  }
};
