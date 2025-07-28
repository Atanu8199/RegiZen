const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  SelectMenuBuilder
} = require('discord.js');

const ScrimSetup = require('../models/ScrimSetup');
const ScrimRegistration = require('../models/ScrimRegistration');

module.exports = async (interaction, client) => {
  if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

  const { guildId, customId, user, channel } = interaction;
  let setup = await ScrimSetup.findOne({ guildId }) || new ScrimSetup({ guildId });

  // 🎛 Admin Panel
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

    return interaction.reply({ embeds: [panelEmbed], components: [panelRow], ephemeral: true });
  }

  // 📋 Create Scrim Configuration
  if (customId === 'create_scrim') {
    const embed = new EmbedBuilder()
      .setTitle('📋 Create Scrim Configuration')
      .setDescription(`Click the buttons below to configure your scrim:\n\nA️⃣ Registration Channel\nB️⃣ Mention Role\nC️⃣ Total Slots\nD️⃣ Tag Count Required\nE️⃣ Scrim Day(s)\nF️⃣ Open Time\nG️⃣ Success Role\nH️⃣ Reaction Emojis`)
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

    return interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
  }

  // 🅰️ Registration Channel
  if (customId === 'conf_A') {
    const options = interaction.guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({ label: `#${c.name}`, value: c.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '📥 Select a registration channel:',
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new SelectMenuBuilder().setCustomId('select_reg_channel').setPlaceholder('Choose...').addOptions(options)
        )
      ]
    });
  }

  if (customId === 'select_reg_channel') {
    setup.channelId = interaction.values[0];
    await setup.save();
    return interaction.update({
      content: `✅ Registration channel set to <#${setup.channelId}>`,
      components: []
    });
  }

  // 🅱️ Mention Role
  if (customId === 'conf_B') {
    const options = interaction.guild.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({ label: r.name, value: r.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '🔔 Select a mention role:',
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new SelectMenuBuilder().setCustomId('select_mention_role').setPlaceholder('Choose...').addOptions(options)
        )
      ]
    });
  }

  if (customId === 'select_mention_role') {
    setup.mentionRoleId = interaction.values[0];
    await setup.save();
    return interaction.update({ content: `✅ Mention role set to <@&${setup.mentionRoleId}>`, components: [] });
  }

  // 🅲 Total Slots
  if (customId === 'conf_C') {
    const modal = new ModalBuilder()
      .setCustomId('modal_total_slots')
      .setTitle('Total Slots')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('total_slots_input')
            .setLabel('Enter number of slots (max 25)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );
    return interaction.showModal(modal);
  }

  if (customId === 'modal_total_slots') {
    const val = interaction.fields.getTextInputValue('total_slots_input');
    const num = parseInt(val);
    if (isNaN(num) || num < 1 || num > 25)
      return interaction.reply({ content: '❌ Enter a valid number (1–25)', ephemeral: true });

    setup.totalSlots = num;
    await setup.save();
    return interaction.reply({ content: `✅ Total slots set to: **${num}**`, ephemeral: true });
  }

  // 🅳 Tag Count
  if (customId === 'conf_D') {
    return interaction.reply({
      content: '🧩 Select how many members must tag:',
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new SelectMenuBuilder()
            .setCustomId('select_tag_count')
            .setPlaceholder('Choose...')
            .addOptions(['1', '2', '3', '4'].map(n => ({ label: n, value: n })))
        )
      ]
    });
  }

  if (customId === 'select_tag_count') {
    setup.tagCountRequired = parseInt(interaction.values[0]);
    await setup.save();
    return interaction.update({ content: `✅ Tag count set to: **${setup.tagCountRequired}**`, components: [] });
  }

  // 🅴 Scrim Days
  if (customId === 'conf_E') {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return interaction.reply({
      content: '📅 Select scrim day(s):',
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new SelectMenuBuilder()
            .setCustomId('select_scrim_days')
            .setPlaceholder('Choose days...')
            .setMinValues(1)
            .setMaxValues(7)
            .addOptions(days.map(d => ({ label: d, value: d })))
        )
      ]
    });
  }

  if (customId === 'select_scrim_days') {
    setup.scrimDays = interaction.values;
    await setup.save();
    return interaction.update({ content: `✅ Scrim days set to: **${setup.scrimDays.join(', ')}**`, components: [] });
  }

  // 🅵 Open Time
  if (customId === 'conf_F') {
    const modal = new ModalBuilder()
      .setCustomId('modal_open_time')
      .setTitle('Scrim Open Time')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('open_time_input')
            .setLabel('Enter time (e.g. 1:00 PM)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );
    return interaction.showModal(modal);
  }

  if (customId === 'modal_open_time') {
    const time = interaction.fields.getTextInputValue('open_time_input');
    if (!time || time.length < 3)
      return interaction.reply({ content: '❌ Invalid time.', ephemeral: true });

    setup.openTime = time;
    await setup.save();
    return interaction.reply({ content: `✅ Open time set to: **${time}**`, ephemeral: true });
  }

  // 🅶 Success Role
  if (customId === 'conf_G') {
    const options = interaction.guild.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({ label: r.name, value: r.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '🏷️ Select a success role (optional):',
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new SelectMenuBuilder().setCustomId('select_success_role').setPlaceholder('Choose...').addOptions(options)
        )
      ]
    });
  }

  if (customId === 'select_success_role') {
    setup.successRoleId = interaction.values[0];
    await setup.save();
    return interaction.update({ content: `✅ Success role set to <@&${setup.successRoleId}>`, components: [] });
  }

  // 🅷 Reaction Emojis
  if (customId === 'conf_H') {
    const modal = new ModalBuilder()
      .setCustomId('modal_reaction_emojis')
      .setTitle('Reaction Emojis')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('reaction_emojis_input')
            .setLabel('Enter emojis (comma-separated)')
            .setPlaceholder('e.g. ✅,🔥,💀')
            .setStyle(TextInputStyle.Short)
        )
      );
    return interaction.showModal(modal);
  }

  if (customId === 'modal_reaction_emojis') {
    const input = interaction.fields.getTextInputValue('reaction_emojis_input') || '';
    setup.reactionEmojis = input.split(',').map(e => e.trim()).filter(Boolean);
    await setup.save();
    return interaction.reply({ content: `✅ Emojis saved: ${setup.reactionEmojis.join(' ') || 'None'}`, ephemeral: true });
  }

  // ✅ Already Registered Check (e.g. on "register_team" modal)
  if (interaction.isModalSubmit() && interaction.customId === 'submit_team_name') {
    const teamName = interaction.fields.getTextInputValue('team_name_input');
    const alreadyRegistered = await ScrimRegistration.findOne({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      userId: interaction.user.id
    });

    if (alreadyRegistered) {
      return interaction.reply({ content: '❌ You already registered in this scrim.', ephemeral: true });
    }

    await ScrimRegistration.create({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      userId: interaction.user.id,
      teamName
    });

    return interaction.reply({ content: `✅ Registered with team name: **${teamName}**`, ephemeral: true });
  }
};
