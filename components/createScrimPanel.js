const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (interaction) => {
  const embed = new EmbedBuilder()
    .setTitle('🟢 Create Scrim Setup Panel')
    .setColor('#00b0f4')
    .setDescription(
      `A. 📢 **Registration Channel:** _Not set_\n` +
      `B. 🏷️ **Mention Role:** _Not set_\n` +
      `C. 🔢 **Total Slots:** _25_\n` +
      `D. 🧩 **Team Tags Required:** _1_\n` +
      `E. 📆 **Scrim Days:** _Not set_\n` +
      `F. ⏰ **Open Time:** _Not set_\n` +
      `G. ✅ **Success Role:** _Not set_\n` +
      `H. 🎭 **Custom Emojis:** _Optional_\n\n` +
      `🔘 Use the buttons below to configure each setting.`
    )
    .setFooter({ text: 'RegiZen • Scrim Config Builder' });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('conf_A').setLabel('A').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('conf_B').setLabel('B').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('conf_C').setLabel('C').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('conf_D').setLabel('D').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('conf_E').setLabel('E').setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('conf_F').setLabel('F').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('conf_G').setLabel('G').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('conf_H').setLabel('H').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('save_scrim').setLabel('✅ Save').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('cancel_scrim').setLabel('❌ Cancel').setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row1, row2],
    ephemeral: true // Optional: only show to admin
  });
};
