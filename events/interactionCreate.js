const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (!interaction.isButton()) return;

  const { guildId, customId, channel, user } = interaction;
  let setup = await ScrimSetup.findOne({ guildId });

  // Create default setup if none exists
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
      messageId: null
    });
  }

  // Control Panel Buttons
  if (customId === 'create_scrim') {
    await updateScrimEmbed(channel, setup);
    await interaction.reply({ content: '✅ Scrim creation panel sent.', ephemeral: true });
  }

  if (customId === 'edit_scrim') {
    await interaction.reply({ content: '🟣 Edit Settings (coming soon)', ephemeral: true });
  }

  if (customId === 'toggle_reg') {
    await interaction.reply({ content: '🟠 Start/Stop Registration (coming soon)', ephemeral: true });
  }

  // Configuration Buttons (A–H)
  if (customId === 'set_reg_channel') {
    await interaction.reply({ content: '📢 Mention the channel for registration.', ephemeral: true });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
    const msg = collected.first();
    const mention = msg.mentions.channels.first();
    if (!mention || mention.type !== ChannelType.GuildText) {
      await msg.reply('❌ Invalid channel.');
      return;
    }
    setup.regChannel = mention.id;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  if (customId === 'set_slot_channel') {
    await interaction.reply({ content: '📂 Mention the slotlist channel.', ephemeral: true });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
    const msg = collected.first();
    const mention = msg.mentions.channels.first();
    if (!mention || mention.type !== ChannelType.GuildText) {
      await msg.reply('❌ Invalid channel.');
      return;
    }
    setup.slotlistChannel = mention.id;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  if (customId === 'set_success_role') {
    await interaction.reply({ content: '✅ Mention the role given after successful registration.', ephemeral: true });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
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

  if (customId === 'set_mentions') {
    await interaction.reply({ content: '🔢 Enter number of required mentions (1-4)', ephemeral: true });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
    const num = parseInt(collected.first().content);
    if (isNaN(num) || num < 1 || num > 4) {
      await collected.first().reply('❌ Invalid number.');
      return;
    }
    setup.mentionsRequired = num;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  if (customId === 'set_total_slots') {
    await interaction.reply({ content: '🔢 Enter total number of scrim slots (e.g., 25)', ephemeral: true });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
    const num = parseInt(collected.first().content);
    if (isNaN(num) || num < 1 || num > 100) {
      await collected.first().reply('❌ Invalid number.');
      return;
    }
    setup.totalSlots = num;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  if (customId === 'set_open_time') {
    await interaction.reply({ content: '⏰ Enter open time (e.g., `2:00 PM`)', ephemeral: true });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
    setup.openTime = collected.first().content;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  if (customId === 'set_scrim_days') {
    await interaction.reply({
      content: '📆 Enter days (comma-separated like: Mo,Tu,We)',
      ephemeral: true
    });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
    const input = collected.first().content.split(',').map(d => d.trim());
    setup.scrimDays = input;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  if (customId === 'set_reactions') {
    await interaction.reply({ content: '😀 Enter 2 emojis for react join (e.g., ✅,❌)', ephemeral: true });
    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected?.size) return;
    const [yes, no] = collected.first().content.split(',').map(e => e.trim());
    setup.reactions = [yes, no];
    await setup.save();
    await updateScrimEmbed(channel, setup);
  }

  // Save / Cancel
  if (customId === 'save_scrim') {
    await interaction.reply({ content: '✅ Scrim setup saved!', ephemeral: true });
  }

  if (customId === 'cancel_scrim') {
    await interaction.update({ content: '❌ Scrim creation cancelled.', embeds: [], components: [] });
  }
};

// Embed Update Helper
async function updateScrimEmbed(channel, setup) {
  const embed = new EmbedBuilder()
    .setTitle('Scrim Setup Panel')
    .setDescription('Use the buttons below to set each scrim setting')
    .addFields(
      { name: '🅰 Reg. Channel:', value: setup.regChannel ? `<#${setup.regChannel}>` : 'Not–Set', inline: true },
      { name: '🅱 Slotlist Channel:', value: setup.slotlistChannel ? `<#${setup.slotlistChannel}>` : 'Not–Set', inline: true },
      { name: '🇨 Success Role:', value: setup.successRole ? `<@&${setup.successRole}>` : 'Not–Set', inline: true },
      { name: '🇩 Mentions:', value: `${setup.mentionsRequired}`, inline: true },
      { name: '🇪 Total Slots:', value: setup.totalSlots ? `${setup.totalSlots}` : 'Not–Set', inline: true },
      { name: '🇫 Open Time:', value: setup.openTime || 'Not–Set', inline: true },
      { name: '🇬 Scrim Days:', value: setup.scrimDays.length ? setup.scrimDays.join(', ') : 'Mo,Tu,We,Th,Fr,Sa,Su', inline: true },
      { name: '🇭 Reactions:', value: setup.reactions.join(', '), inline: true }
    )
    .setColor('Blue');

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

  try {
    if (setup.messageId) {
      const oldMsg = await channel.messages.fetch(setup.messageId).catch(() => null);
      if (oldMsg) {
        await oldMsg.edit({ embeds: [embed], components: [row1, row2] });
        return;
      }
    }
    const msg = await channel.send({ embeds: [embed], components: [row1, row2] });
    setup.messageId = msg.id;
    await setup.save();
  } catch (err) {
    console.error('❌ Failed to update embed:', err.message);
  }
}
