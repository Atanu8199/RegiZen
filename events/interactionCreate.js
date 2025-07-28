const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

  const { guildId, customId } = interaction;

  console.log("Interaction:", customId);

  let setup = await ScrimSetup.findOne({ guildId }) || new ScrimSetup({ guildId });

  // Show Scrim Setup Panel
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
      flags: 1 << 6
    });
  }

  // === A to H Buttons ===

  // A️⃣ Registration Channel
  if (customId === 'conf_A') {
    const options = interaction.guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({ label: `#${c.name}`, value: c.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '📥 Select a registration channel:',
      flags: 1 << 6,
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: 'select_reg_channel',
          placeholder: 'Choose a channel...',
          options
        }]
      }]
    });
  }

  if (interaction.customId === 'select_reg_channel') {
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
    const options = interaction.guild.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({ label: r.name, value: r.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '🔔 Select a role to mention:',
      flags: 1 << 6,
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: 'select_mention_role',
          placeholder: 'Choose a role...',
          options
        }]
      }]
    });
  }

  if (interaction.customId === 'select_mention_role') {
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
    return interaction.showModal({
      custom_id: 'modal_total_slots',
      title: 'Enter Total Slots',
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: 'total_slots_input',
          style: 1,
          label: 'Total Team Slots',
          placeholder: 'e.g. 16, 20, 25',
          required: true
        }]
      }]
    });
  }

  if (interaction.customId === 'modal_total_slots') {
    const total = parseInt(interaction.fields.getTextInputValue('total_slots_input'));
    if (isNaN(total) || total < 1 || total > 25) {
      return interaction.reply({ content: '❌ Enter a valid number (1–25).', ephemeral: true });
    }

    setup.totalSlots = total;
    await setup.save();

    return interaction.reply({ content: `✅ Total slots set to: **${total}**`, ephemeral: true });
  }

  // D️⃣ Tag Count
  if (customId === 'conf_D') {
    return interaction.showModal({
      custom_id: 'modal_tag_count',
      title: 'Enter Required Tag Count',
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: 'tag_count_input',
          style: 1,
          label: 'Team Members Tag Count (1–4)',
          placeholder: 'e.g. 2',
          required: true
        }]
      }]
    });
  }

  if (interaction.customId === 'modal_tag_count') {
    const count = parseInt(interaction.fields.getTextInputValue('tag_count_input'));
    if (isNaN(count) || count < 1 || count > 4) {
      return interaction.reply({ content: '❌ Enter a valid number between 1–4.', ephemeral: true });
    }

    setup.tagCount = count;
    await setup.save();

    return interaction.reply({ content: `✅ Required tag count: **${count}**`, ephemeral: true });
  }

  // E️⃣ Scrim Day(s)
  if (customId === 'conf_E') {
    return interaction.reply({
      content: '📅 Select Scrim Days:',
      ephemeral: true,
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: 'select_scrim_days',
          placeholder: 'Choose scrim days...',
          min_values: 1,
          max_values: 7,
          options: [
            { label: 'Monday', value: 'Monday' },
            { label: 'Tuesday', value: 'Tuesday' },
            { label: 'Wednesday', value: 'Wednesday' },
            { label: 'Thursday', value: 'Thursday' },
            { label: 'Friday', value: 'Friday' },
            { label: 'Saturday', value: 'Saturday' },
            { label: 'Sunday', value: 'Sunday' }
          ]
        }]
      }]
    });
  }

  if (interaction.customId === 'select_scrim_days') {
    const days = interaction.values;
    setup.scrimDays = days;
    await setup.save();

    return interaction.update({ content: `✅ Scrim days set to: **${days.join(', ')}**`, components: [] });
  }

  // F️⃣ Open Time
  if (customId === 'conf_F') {
    return interaction.showModal({
      custom_id: 'modal_open_time',
      title: 'Enter Registration Open Time',
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: 'open_time_input',
          style: 1,
          label: 'Open Time (e.g. 1:00 PM)',
          placeholder: 'e.g. 2:30 PM',
          required: true
        }]
      }]
    });
  }

  if (interaction.customId === 'modal_open_time') {
    const time = interaction.fields.getTextInputValue('open_time_input');
    setup.openTime = time;
    await setup.save();

    return interaction.reply({ content: `✅ Open time set to: **${time}**`, ephemeral: true });
  }

  // G️⃣ Success Role
  if (customId === 'conf_G') {
    const options = interaction.guild.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({ label: r.name, value: r.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '✅ Select Success Role (given after registration):',
      ephemeral: true,
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: 'select_success_role',
          placeholder: 'Choose a role...',
          options
        }]
      }]
    });
  }

  if (interaction.customId === 'select_success_role') {
    const roleId = interaction.values[0];
    setup.successRole = roleId;
    await setup.save();

    return interaction.update({ content: `✅ Success role set to: <@&${roleId}>`, components: [] });
  }

  // H️⃣ Reaction Emojis
  if (customId === 'conf_H') {
    return interaction.showModal({
      custom_id: 'modal_react_emojis',
      title: 'Custom Reaction Emojis',
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: 'emoji_input',
          style: 1,
          label: 'Emojis (e.g. ✅,🔥)',
          placeholder: 'Leave blank for default',
          required: false
        }]
      }]
    });
  }

  if (interaction.customId === 'modal_react_emojis') {
    const emojis = interaction.fields.getTextInputValue('emoji_input') || '';
    setup.reactionEmojis = emojis.split(',').map(e => e.trim()).filter(Boolean);
    await setup.save();

    return interaction.reply({ content: `✅ Reaction emojis set to: ${setup.reactionEmojis.join(' ') || '✅ (default)'}`, ephemeral: true });
  }
};
