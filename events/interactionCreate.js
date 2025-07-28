const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (interaction.isButton()) {
    const { guildId, customId, channel } = interaction;

    let setup = await ScrimSetup.findOne({ guildId });
    if (!setup) {
      setup = new ScrimSetup({ guildId });
    }

    // 🟢 Main Panel: Setup Scrims
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
        ephemeral: true
      });
    }

    // 🟢 A️⃣ Registration Channel
    if (customId === 'conf_A') {
      const channelOptions = interaction.guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText)
        .map(c => ({
          label: `#${c.name}`,
          value: c.id
        }))
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
                options: channelOptions
              }
            ]
          }
        ]
      });
    }

    // 🟡 Placeholders for other buttons (B–H)
    if (customId.startsWith('conf_')) {
      return interaction.reply({
        content: `🔧 This option is under construction.`,
        ephemeral: true
      });
    }
  }

  // 🟣 Dropdown Select Handler
  if (interaction.isSelectMenu()) {
    const { customId, values, guildId } = interaction;

    if (customId === 'select_reg_channel') {
      const selectedChannelId = values[0];

      let setup = await ScrimSetup.findOne({ guildId });
      if (!setup) {
        setup = new ScrimSetup({ guildId });
      }

      setup.registrationChannel = selectedChannelId;
      await setup.save();

      return interaction.update({
        content: `✅ Registration channel set to <#${selectedChannelId}>.`,
        components: []
      });
    }
  }
};
