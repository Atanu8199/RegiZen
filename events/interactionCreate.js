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
  let setup = await ScrimSetup.findOne({ guildId }) || new ScrimSetup({ guildId });

  // 🧷 Scrim Admin Panel buttons
  if (customId === 'setup_scrims') {
    const panelEmbed = new EmbedBuilder()
      .setTitle('📢 Scrim Admin Panel')
      .setDescription('Select an option below to manage your scrims.')
      .setColor('#00b0f4')
      .setFooter({ text: 'RegiZen • Scrim Control' });

    const panelRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('create_scrim').setLabel('📋 Create Scrim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('edit_scrim').setLabel('⚙️ Edit Settings').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('toggle_registration').setLabel('🟢 Start/Stop Registration').setStyle(ButtonStyle.Primary)
    );

    return interaction.reply({
      embeds: [panelEmbed],
      components: [panelRow],
      ephemeral: true
    });
  }

  // 📋 Create Scrim → Show Steps A–H
  if (customId === 'create_scrim') {
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
      ephemeral: true
    });
  }

  // A – H configuration steps
  // A: Registration Channel
  if (customId === 'conf_A') {
    const options = interaction.guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({ label: `#${c.name}`, value: c.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '📥 Select a registration channel:',
      ephemeral: true,
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

  if (interaction.customId === 'select_reg_channel') {
    setup.registrationChannel = interaction.values[0];
    await setup.save();
    return interaction.update({
      content: `✅ Registration channel set to <#${setup.registrationChannel}>`,
      components: []
    });
  }

  // B: Mention Role
  if (customId === 'conf_B') {
    const options = interaction.guild.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({ label: r.name, value: r.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '🔔 Select a mention role:',
      ephemeral: true,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_mention_role',
              placeholder: 'Choose a role...',
              options
            }
          ]
        }
      ]
    });
  }

  if (interaction.customId === 'select_mention_role') {
    setup.mentionRole = interaction.values[0];
    await setup.save();
    return interaction.update({
      content: `✅ Mention role set to <@&${setup.mentionRole}>`,
      components: []
    });
  }

  // C: Total Slots
  if (customId === 'conf_C') {
    return interaction.showModal({
      custom_id: 'modal_total_slots',
      title: 'Total Slots',
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'total_slots_input',
              style: 1,
              label: 'Enter number of slots (Max 25)',
              placeholder: 'Example: 16, 20, 25',
              required: true
            }
          ]
        }
      ]
    });
  }

  if (interaction.customId === 'modal_total_slots') {
    const val = interaction.fields.getTextInputValue('total_slots_input');
    const num = parseInt(val);
    if (isNaN(num) || num < 1 || num > 25) {
      return interaction.reply({ content: '❌ Please enter a valid number (1–25)', ephemeral: true });
    }
    setup.totalSlots = num;
    await setup.save();
    return interaction.reply({ content: `✅ Total slots set to: **${num}**`, ephemeral: true });
  }

  // D: Tag Count
  if (customId === 'conf_D') {
    return interaction.reply({
      content: '🧩 Select how many members must tag when registering:',
      ephemeral: true,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_tag_count',
              placeholder: 'Choose...',
              options: ['1', '2', '3', '4'].map(n => ({ label: n, value: n }))
            }
          ]
        }
      ]
    });
  }

  if (interaction.customId === 'select_tag_count') {
    setup.tagCount = parseInt(interaction.values[0]);
    await setup.save();
    return interaction.update({
      content: `✅ Tag count set to: **${setup.tagCount}**`,
      components: []
    });
  }

  // E: Scrim Days
  if (customId === 'conf_E') {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return interaction.reply({
      content: '📅 Select scrim day(s):',
      ephemeral: true,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_scrim_days',
              min_values: 1,
              max_values: 7,
              placeholder: 'Choose days...',
              options: days.map(d => ({ label: d, value: d }))
            }
          ]
        }
      ]
    });
  }

  if (interaction.customId === 'select_scrim_days') {
    setup.scrimDays = interaction.values;
    await setup.save();
    return interaction.update({
      content: `✅ Scrim days set to: **${setup.scrimDays.join(', ')}**`,
      components: []
    });
  }

  // F: Open Time
  if (customId === 'conf_F') {
    return interaction.showModal({
      custom_id: 'modal_open_time',
      title: 'Open Time',
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'open_time_input',
              style: 1,
              label: 'Enter time (e.g. 1:00 PM)',
              required: true
            }
          ]
        }
      ]
    });
  }

  if (interaction.customId === 'modal_open_time') {
    const val = interaction.fields.getTextInputValue('open_time_input');
    if (!val || val.length < 3) {
      return interaction.reply({ content: '❌ Invalid time format.', ephemeral: true });
    }
    setup.openTime = val;
    await setup.save();
    return interaction.reply({ content: `✅ Open time set to: **${val}**`, ephemeral: true });
  }

  // G: Success Role
  if (customId === 'conf_G') {
    const options = interaction.guild.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({ label: r.name, value: r.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '🏷️ Select a success role (given after registration):',
      ephemeral: true,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_success_role',
              placeholder: 'Choose a role...',
              options
            }
          ]
        }
      ]
    });
  }

  if (interaction.customId === 'select_success_role') {
    setup.successRole = interaction.values[0];
    await setup.save();
    return interaction.update({
      content: `✅ Success role set to: <@&${setup.successRole}>`,
      components: []
    });
  }

  // H: Reaction Emojis
  if (customId === 'conf_H') {
    return interaction.showModal({
      custom_id: 'modal_reaction_emojis',
      title: 'Reaction Emojis',
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'reaction_emojis_input',
              style: 1,
              label: 'Enter custom emojis (comma-separated)',
              placeholder: 'e.g. 🔥,✅,💀',
              required: false
            }
          ]
        }
      ]
    });
  }

  if (interaction.customId === 'modal_reaction_emojis') {
    const emojis = interaction.fields.getTextInputValue('reaction_emojis_input') || '';
    setup.reactionEmojis = emojis.split(',').map(e => e.trim()).filter(Boolean);
    await setup.save();
    return interaction.reply({ content: `✅ Reaction emojis saved: ${setup.reactionEmojis.join(' ') || 'None'}`, ephemeral: true });
  }
};
