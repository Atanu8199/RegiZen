const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (!interaction.isButton()) return;

  const { guildId, customId, channel, user } = interaction;

  let setup = await ScrimSetup.findOne({ guildId });
  if (!setup) {
    setup = await ScrimSetup.create({
      guildId,
      regChannel: null,
      slotlistChannel: null,
      successRole: null,
      mentionsRequired: 4,
      totalSlots: null,
      openTime: null,
      scrimDays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      reactions: ['✅', '❌'],
      messageId: null,
    });
  }

  // 🟢 Create Scrim
  if (customId === 'create_scrim') {
    await updateScrimEmbed(channel, setup);
    await interaction.reply({ content: '🛠️ Scrim setup panel sent.', ephemeral: true });
  }

  // 🟣 Edit Settings
  if (customId === 'edit_scrim') {
    await interaction.reply({ content: '🟣 Edit Settings clicked! (Coming soon)', ephemeral: true });
  }

  // ✅ Toggle Registration
  if (customId === 'toggle_reg') {
    await interaction.reply({ content: '⏯️ Start/Stop Registration clicked! (Coming soon)', ephemeral: true });
  }

  // 🅰 Set Registration Channel
  if (customId === 'set_reg_channel') {
    await interaction.reply({ content: '📢 Mention the registration channel (e.g. #register-here)', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const mentioned = msg.mentions.channels.first();

    if (!mentioned || mentioned.type !== ChannelType.GuildText) {
      await msg.reply('❌ Please mention a valid text channel.');
      return;
    }

    setup.regChannel = mentioned.id;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // 🅱 Set Slotlist Channel
  if (customId === 'set_slot_channel') {
    await interaction.reply({ content: '📂 Mention the slotlist channel.', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const mentioned = msg.mentions.channels.first();

    if (!mentioned || mentioned.type !== ChannelType.GuildText) {
      await msg.reply('❌ Please mention a valid text channel.');
      return;
    }

    setup.slotlistChannel = mentioned.id;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // 🇨 Set Success Role
  if (customId === 'set_success_role') {
    await interaction.reply({ content: '🎖️ Mention the success role (e.g. @Registered)', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const role = msg.mentions.roles.first();

    if (!role) {
      await msg.reply('❌ Please mention a valid role.');
      return;
    }

    setup.successRole = role.id;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // 🇩 Set Required Mentions
  if (customId === 'set_mentions') {
    await interaction.reply({ content: '🔢 Enter required mentions (1–4)', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const value = parseInt(msg.content);

    if (isNaN(value) || value < 1 || value > 4) {
      await msg.reply('❌ Enter a valid number between 1 and 4.');
      return;
    }

    setup.mentionsRequired = value;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // 🇪 Set Total Slots
  if (customId === 'set_total_slots') {
    await interaction.reply({ content: '🎯 Enter total number of slots (e.g. 25)', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const value = parseInt(msg.content);

    if (isNaN(value) || value < 1 || value > 100) {
      await msg.reply('❌ Enter a valid number between 1 and 100.');
      return;
    }

    setup.totalSlots = value;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // 🇫 Set Open Time
  if (customId === 'set_open_time') {
    await interaction.reply({ content: '⏰ Enter registration open time (e.g. 12:00 PM)', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    setup.openTime = msg.content;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // 🇬 Set Scrim Days
  if (customId === 'set_scrim_days') {
    await interaction.reply({ content: '📆 Enter scrim days (e.g. Mo,Tu,We)', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const days = msg.content.split(',').map(d => d.trim().slice(0, 2));
    setup.scrimDays = days;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // 🇭 Set Reactions
  if (customId === 'set_reactions') {
    await interaction.reply({ content: '😄 Enter 2 emojis separated by comma (e.g. ✅,❌)', ephemeral: true });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const emojis = msg.content.split(',').map(e => e.trim());

    if (emojis.length !== 2) {
      await msg.reply('❌ Please provide exactly 2 emojis separated by comma.');
      return;
    }

    setup.reactions = emojis;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // ❌ Cancel Button
  if (customId === 'cancel_scrim') {
    await interaction.update({ content: '❌ Scrim creation cancelled.', embeds: [], components: [] });
  }

  // ✅ Save Scrim
  if (customId === 'save_scrim') {
    await interaction.reply({ content: '✅ Scrim settings saved.', ephemeral: true });
  }
};

// 🔧 Embed Update Function
async function updateScrimEmbed(channel, setup) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Scrim Configuration')
    .setDescription('Click the buttons A–H to configure your scrim.\nPress **Save** when done or **Cancel** to discard.')
    .addFields(
      { name: '🅰 Reg. Channel:', value: setup.regChannel ? `<#${setup.regChannel}>` : 'Not Set', inline: true },
      { name: '🅱 Slotlist Channel:', value: setup.slotlistChannel ? `<#${setup.slotlistChannel}>` : 'Not Set', inline: true },
      { name: '🇨 Success Role:', value: setup.successRole ? `<@&${setup.successRole}>` : 'Not Set', inline: true },
      { name: '🇩 Required Mentions:', value: `${setup.mentionsRequired}`, inline: true },
      { name: '🇪 Total Slots:', value: setup.totalSlots ? `${setup.totalSlots}` : 'Not Set', inline: true },
      { name: '🇫 Open Time:', value: setup.openTime || 'Not Set', inline: true },
      { name: '🇬 Scrim Days:', value: setup.scrimDays.length ? setup.scrimDays.join(', ') : 'Not Set', inline: true },
      { name: '🇭 Reactions:', value: setup.reactions.join(', '), inline: true }
    )
    .setColor('Blurple');

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('set_reg_channel').setLabel('A').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('set_slot_channel').setLabel('B').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('set_success_role').setLabel('C').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('set_mentions').setLabel('D').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('set_total_slots').setLabel('E').setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('set_open_time').setLabel('F').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('set_scrim_days').setLabel('G').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('set_reactions').setLabel('H').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('cancel_scrim').setLabel('Cancel').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('save_scrim').setLabel('Save Scrim').setStyle(ButtonStyle.Success)
  );

  if (setup.messageId) {
    try {
      const msg = await channel.messages.fetch(setup.messageId);
      await msg.edit({ embeds: [embed], components: [row1, row2] });
    } catch (err) {
      console.error('🔁 Could not edit old embed:', err.message);
      const msg = await channel.send({ embeds: [embed], components: [row1, row2] });
      setup.messageId = msg.id;
      await setup.save();
    }
  } else {
    const msg = await channel.send({ embeds: [embed], components: [row1, row2] });
    setup.messageId = msg.id;
    await setup.save();
  }
}
