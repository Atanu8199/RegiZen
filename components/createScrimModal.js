const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function createScrimPanel(data = {}) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Enter details & Press Save')
    .setDescription('Scrim Creation is a piece of cake through dashboard, *Click Me*')
    .addFields(
      { name: '🅰 Reg. Channel:', value: data.regChannel || 'Not–Set', inline: true },
      { name: '🅱 Slotlist Channel:', value: data.slotlistChannel || 'Not–Set', inline: true },
      { name: '🅲 Success Role:', value: data.successRole || 'Not–Set', inline: true },
      { name: '🅳 Req. Mentions:', value: data.requiredMentions?.toString() || 'Not–Set', inline: true },
      { name: '🅴 Total Slots:', value: data.totalSlots?.toString() || 'Not–Set', inline: true },
      { name: '🅵 Open Time:', value: data.openTime || 'Not–Set', inline: true },
      { name: '🅶 Scrim Days:', value: data.scrimDays?.join(', ') || 'Not–Set', inline: true },
      { name: '🅷 Reactions:', value: data.reactions?.join(' ') || '✅ ❌', inline: true }
    )
    .setColor('#00aaff');

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('set_a').setLabel('A').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('set_b').setLabel('B').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('set_c').setLabel('C').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('set_d').setLabel('D').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('set_e').setLabel('E').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('set_f').setLabel('F').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('set_g').setLabel('G').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('set_h').setLabel('H').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('cancel_scrim').setLabel('Cancel').setStyle(ButtonStyle.Danger)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('save_scrim').setLabel('Save Scrim').setStyle(ButtonStyle.Success)
  );

  return {
    embed,
    components: [row1, row2, row3]
  };
}

module.exports = createScrimPanel;
