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

  // 🔧 Initialize if not found
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

  // 🔘 MAIN PANEL BUTTONS
  if (customId === 'create_scrim') {
    await interaction.deferUpdate();
    await sendScrimConfigPanel(channel, setup, user);
    return;
  }

  if (customId === 'edit_scrim') {
    await interaction.reply({
      content: '🛠 Edit settings feature coming soon.',
      ephemeral: true
    });
    return;
  }

  if (customId === 'toggle_reg') {
    await interaction.reply({
      content: '🔄 Start/Stop Registration feature coming soon.',
      ephemeral: true
    });
    return;
  }

  if (customId === 'manage_slotlist') {
    await interaction.reply({
      content: '📂 Slotlist Manager coming soon.',
      ephemeral: true
    });
    return;
  }

  if (customId === 'scrim_help') {
    await interaction.reply({
      content: '❓ This panel lets you configure scrim settings. Click each A–H button to set the value.',
      ephemeral: true
    });
    return;
  }

  // 🅰 Set Registration Channel
  if (customId === 'set_reg_channel') {
    await interaction.reply({
      content: '🔧 Mention the channel for registrations (e.g. #registrations)',
      ephemeral: true
    });

    const filter = m => m.author.id === user.id;
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
    if (!collected || collected.size === 0) return;

    const msg = collected.first();
    const mentioned = msg.mentions.channels.first();

    if (!mentioned || mentioned.type !== ChannelType.GuildText) {
      await msg.reply('❌ Invalid. Please mention a text channel.');
      return;
    }

    setup.regChannel = mentioned.id;
    await setup.save();
    await sendScrimConfigPanel(channel, setup, user);
  }

  // ✅ Save Button
  if (customId === 'save_scrim') {
    await interaction.reply({ content: '✅ Scrim settings saved.', ephemeral: true });
    return;
  }

  // ❌ Cancel Button
  if (customId === 'cancel_scrim') {
    await interaction.update({
      content: '❌ Scrim setup cancelled.',
      embeds: [],
      components: []
    });
    return;
  }
};

// 🔧 Function to send full A–H config panel
async function sendScrimConfigPanel(channel, setup, user) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Scrim Setup Form')
    .setDescription(
      `| Button | Kaam                        | Status   |
| ------ | --------------------------- | -------- |
| 🅰️ A  | Registration Channel select | ${setup.regChannel ? '✅ Done' : '⏳'}   |
| 🅱️ B  | Slotlist Channel select     | ${setup.slotlistChannel ? '✅ Done' : '🔄 Next?'} |
| 🇨 C   | Success Role select         | ${setup.successRole ? '✅ Done' : '⏳'}        |
| 🇩 D   | Mentions Required           | ${setup.mentionsRequired ? '✅ Done' : '⏳'}        |
| 🇪 E   | Total Slots                 | ${setup.totalSlots ? '✅ Done' : '⏳'}        |
| 🇫 F   | Registration Open Time      | ${setup.openTime ? '✅ Done' : '⏳'}        |
| 🇬 G   | Scrim Days (multi select)   | ${setup.scrimDays.length > 0 ? '✅ Done' : '⏳'}        |
| 🇭 H   | Reaction Emojis             | ${setup.reactions.length > 0 ? '✅ Done' : '⏳'}        |`
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

  await channel.send({
    content: `🔧 <@${user.id}> started scrim setup.`,
    embeds: [embed],
    components: [row1, row2]
  });
}
