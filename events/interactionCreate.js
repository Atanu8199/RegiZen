const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const ScrimSetup = require('../models/ScrimSetup');
const ScrimRegistration = require('../models/ScrimRegistration');

module.exports = async (interaction, client) => {
  if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

  const { guildId, customId, channel, user } = interaction;

  // ========== Handle Registration ==========
  if (customId === 'register_scrim') {
    const userId = user.id;
    const channelId = channel.id;

    const alreadyRegistered = await ScrimRegistration.findOne({ guildId, channelId, userId });
    if (alreadyRegistered) {
      return interaction.reply({
        content: '❌ You have already registered in this scrim.',
        ephemeral: true,
      });
    }

    // ✅ Save new registration
    await ScrimRegistration.create({
      guildId,
      channelId,
      userId,
      timestamp: Date.now(),
    });

    return interaction.reply({
      content: '✅ You have successfully registered for this scrim!',
      ephemeral: true,
    });
  }

  // ========== Scrim Setup Panel ==========
  if (customId === 'setup_scrims') {
    const embed = new EmbedBuilder()
      .setTitle('📋 RegiZen Scrim Setup Panel')
      .setDescription('Please select an option below to configure or manage scrims.')
      .setColor('Blurple');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('create_scrim').setLabel('🆕 Create Scrim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('edit_settings').setLabel('⚙️ Edit Settings').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('toggle_registration').setLabel('📥 Start/Stop Registration').setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  // ========== Create Scrim: Show A–H Panel ==========
  if (customId === 'create_scrim') {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Scrim Configuration')
      .setDescription(`
A. Registration Channel
B. Mention Role
C. Total Slots
D. Team Tag Count Required
E. Scrim Day(s)
F. Registration Open Time
G. Success Role
H. Reaction Emojis
      `)
      .setColor('Orange');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('step_a').setLabel('A').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('step_b').setLabel('B').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('step_c').setLabel('C').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('step_d').setLabel('D').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('step_e').setLabel('E').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('step_f').setLabel('F').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('step_g').setLabel('G').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('step_h').setLabel('H').setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({ embeds: [embed], components: [row, row2], ephemeral: true });
  }

  // ========== Individual Config Steps ==========
  let setup = await ScrimSetup.findOne({ guildId, channelId: channel.id });
  if (!setup) {
    setup = new ScrimSetup({ guildId, channelId: channel.id });
  }

  // A. Registration Channel (current channel)
  if (customId === 'step_a') {
    setup.channelId = channel.id;
    await setup.save();

    return interaction.reply({
      content: `✅ Registration channel set to <#${channel.id}>`,
      ephemeral: true,
    });
  }

  // B. Mention Role
  if (customId === 'step_b') {
    const roles = interaction.guild.roles.cache.map(role => ({
      label: role.name,
      value: role.id,
    })).slice(0, 25);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_mention_role')
      .setPlaceholder('Select mention role')
      .addOptions(roles);

    return interaction.reply({
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    });
  }

  if (customId === 'select_mention_role') {
    const roleId = interaction.values[0];
    setup.mentionRoleId = roleId;
    await setup.save();

    return interaction.update({
      content: `✅ Mention role set to <@&${roleId}>`,
      components: [],
    });
  }

  // C. Total Slots
  if (customId === 'step_c') {
    const modal = new ModalBuilder()
      .setCustomId('modal_slots')
      .setTitle('Total Slots')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('slot_input')
            .setLabel('Enter total number of slots')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

    return interaction.showModal(modal);
  }

  if (customId === 'modal_slots') {
    const slots = parseInt(interaction.fields.getTextInputValue('slot_input'));
    if (isNaN(slots) || slots < 1) {
      return interaction.reply({ content: '❌ Invalid slot number.', ephemeral: true });
    }

    setup.totalSlots = slots;
    await setup.save();
    return interaction.reply({ content: `✅ Total slots set to ${slots}`, ephemeral: true });
  }

  // D. Tag Count Required
  if (customId === 'step_d') {
    const modal = new ModalBuilder()
      .setCustomId('modal_tags')
      .setTitle('Tag Count Required')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('tag_input')
            .setLabel('Enter required tag count (1-4)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

    return interaction.showModal(modal);
  }

  if (customId === 'modal_tags') {
    const tags = parseInt(interaction.fields.getTextInputValue('tag_input'));
    if (isNaN(tags) || tags < 1 || tags > 4) {
      return interaction.reply({ content: '❌ Invalid tag count.', ephemeral: true });
    }

    setup.tagCountRequired = tags;
    await setup.save();
    return interaction.reply({ content: `✅ Required tag count set to ${tags}`, ephemeral: true });
  }

  // E. Scrim Day(s)
  if (customId === 'step_e') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
      label: d,
      value: d,
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_scrim_days')
      .setPlaceholder('Select scrim days')
      .setMinValues(1)
      .setMaxValues(7)
      .addOptions(days);

    return interaction.reply({
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    });
  }

  if (customId === 'select_scrim_days') {
    setup.scrimDays = interaction.values;
    await setup.save();

    return interaction.update({
      content: `✅ Scrim days set: ${interaction.values.join(', ')}`,
      components: [],
    });
  }

  // F. Registration Open Time
  if (customId === 'step_f') {
    const modal = new ModalBuilder()
      .setCustomId('modal_open_time')
      .setTitle('Open Time')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('time_input')
            .setLabel('Enter open time (e.g., 12:30 PM)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

    return interaction.showModal(modal);
  }

  if (customId === 'modal_open_time') {
    const openTime = interaction.fields.getTextInputValue('time_input');
    setup.openTime = openTime;
    await setup.save();

    return interaction.reply({ content: `✅ Registration open time set to ${openTime}`, ephemeral: true });
  }

  // G. Success Role
  if (customId === 'step_g') {
    const roles = interaction.guild.roles.cache.map(role => ({
      label: role.name,
      value: role.id,
    })).slice(0, 25);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_success_role')
      .setPlaceholder('Select success role')
      .addOptions(roles);

    return interaction.reply({
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    });
  }

  if (customId === 'select_success_role') {
    const roleId = interaction.values[0];
    setup.successRoleId = roleId;
    await setup.save();

    return interaction.update({
      content: `✅ Success role set to <@&${roleId}>`,
      components: [],
    });
  }

  // H. Reaction Emojis
  if (customId === 'step_h') {
    const modal = new ModalBuilder()
      .setCustomId('modal_emojis')
      .setTitle('Custom Emojis')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('emoji_input')
            .setLabel('Enter emojis separated by space or comma')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        )
      );

    return interaction.showModal(modal);
  }

  if (customId === 'modal_emojis') {
    const emojiText = interaction.fields.getTextInputValue('emoji_input');
    const emojis = emojiText.split(/[\s,]+/).filter(e => e.length > 0);

    setup.reactionEmojis = emojis;
    await setup.save();

    return interaction.reply({ content: `✅ Reaction emojis set: ${emojis.join(' ')}`, ephemeral: true });
  }
};
