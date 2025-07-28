const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Events } = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  try {
    // Handle Button Interactions
    if (interaction.isButton()) {
      const { guildId, customId, channel } = interaction;
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
          messageId: null
        });
      }

      // Panel Button Handling
      const buttonHandlers = {
        'create_scrim': async () => {
          await interaction.reply({ content: '🟢 Create Scrim panel loading...', ephemeral: true });
          await updateScrimEmbed(channel, setup);
        },
        'edit_scrim': () => interaction.reply({ content: '🟣 Edit Settings coming soon.', ephemeral: true }),
        'toggle_reg': () => interaction.reply({ content: '✅ Start/Stop Registration coming soon.', ephemeral: true }),
        'manage_slotlist': () => interaction.reply({ content: '📂 Manage Slotlist coming soon.', ephemeral: true }),
        'reserve_slots': () => interaction.reply({ content: '📌 Reserve Slots coming soon.', ephemeral: true }),
        'ban_unban': () => interaction.reply({ content: '🚫 Ban/Unban coming soon.', ephemeral: true }),
        'enable_disable_scrim': () => interaction.reply({ content: '🔄 Enable/Disable coming soon.', ephemeral: true }),
        'design_scrim': () => interaction.reply({ content: '🎨 Design coming soon.', ephemeral: true }),
        'drop_location': () => interaction.reply({ content: '🗺️ Drop Location coming soon.', ephemeral: true }),
        'scrim_help': () => interaction.reply({ content: '❓ Use buttons A–H to configure scrim.', ephemeral: true }),

        // Cancel
        'cancel_scrim': () => interaction.update({ content: '❌ Scrim creation cancelled.', embeds: [], components: [] }),

        // Save
        'save_scrim': () => interaction.reply({ content: '✅ Scrim settings saved successfully.', ephemeral: true })
      };

      if (buttonHandlers[customId]) return buttonHandlers[customId]();

      // A: Set Registration Channel
      if (customId === 'set_reg_channel') {
        await interaction.reply({ content: '📢 Mention the registration channel.', ephemeral: true });

        const filter = m => m.author.id === interaction.user.id;
        const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
        if (!collected || collected.size === 0) return;

        const userMsg = collected.first();
        const mentionedChannel = userMsg.mentions.channels.first();

        if (!mentionedChannel || mentionedChannel.type !== ChannelType.GuildText) {
          await userMsg.reply('❌ Invalid channel. Please mention a #text-channel.');
          return;
        }

        setup.regChannel = mentionedChannel.id;
        await setup.save();
        await updateScrimEmbed(channel, setup);
      }

      // Additional buttons (B–H) can be added similarly...
    }

    // Handle Message Commands (like !RZSETUP)
    if (interaction.isChatInputCommand || interaction.isMessageComponent()) return;

    const message = interaction;
    if (!message.content) return;

    if (message.content.toLowerCase() === '!rzsetup') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('create_scrim').setLabel('Create Scrim').setStyle(ButtonStyle.Success).setEmoji('🛠️'),
        new ButtonBuilder().setCustomId('edit_scrim').setLabel('Edit Settings').setStyle(ButtonStyle.Primary).setEmoji('⚙️'),
        new ButtonBuilder().setCustomId('toggle_reg').setLabel('Start/Stop Registration').setStyle(ButtonStyle.Secondary).setEmoji('✅'),
        new ButtonBuilder().setCustomId('scrim_help').setLabel('Help').setStyle(ButtonStyle.Secondary).setEmoji('❓')
      );

      const embed = new EmbedBuilder()
        .setTitle('🛠️ Scrim Control Panel')
        .setDescription('Manage your scrims using the buttons below.\nClick **Create Scrim** to begin.')
        .setColor('DarkButNotBlack');

      await message.reply({ embeds: [embed], components: [row] });
    }
  } catch (err) {
    console.error('❌ interactionCreate.js error:', err);
    if (interaction.reply) {
      try {
        await interaction.reply({ content: '❌ Error while handling the interaction.', ephemeral: true });
      } catch (_) {}
    }
  }
};

// 🔧 Update Panel Embed
async function updateScrimEmbed(channel, setup) {
  const embed = new EmbedBuilder()
    .setTitle('Enter details & Press Save')
    .setDescription('Scrim Creation is a piece of cake through dashboard, [Click Me](https://example.com)')
    .addFields(
      { name: '🅰 Reg. Channel:', value: setup.regChannel ? `<#${setup.regChannel}>` : 'Not–Set', inline: true },
      { name: '🅱 Slotlist Channel:', value: setup.slotlistChannel ? `<#${setup.slotlistChannel}>` : 'Not–Set', inline: true },
      { name: '🇨 Success Role:', value: setup.successRole ? `<@&${setup.successRole}>` : 'Not–Set', inline: true },
      { name: '🇩 Req. Mentions:', value: `${setup.mentionsRequired}`, inline: true },
      { name: '🇪 Total Slots:', value: setup.totalSlots ? `${setup.totalSlots}` : 'Not–Set', inline: true },
      { name: '🇫 Open Time:', value: setup.openTime || 'Not–Set', inline: true },
      { name: '🇬 Scrim Days:', value: setup.scrimDays.join(', ') || 'Not–Set', inline: true },
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
    console.error('❌ Embed update failed:', err.message);
  }
}
