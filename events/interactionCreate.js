const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (!interaction.isButton() && !interaction.isSelectMenu()) return;

  const { guildId, customId } = interaction;

  // Debug log
  console.log("Interaction:", customId);

  // Fetch or create scrim setup for this guild
  let setup = await ScrimSetup.findOne({ guildId }) || new ScrimSetup({ guildId });

  // STEP 1: Show setup panel when clicking "Setup Scrim"
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
      flags: 1 << 6 // Use this instead of "ephemeral: true"
    });
  }

  // STEP A: Registration Channel
  if (customId === 'conf_A') {
    const options = interaction.guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({ label: `#${c.name}`, value: c.id }))
      .slice(0, 25);

    return interaction.reply({
      content: '📥 Select a registration channel:',
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
      ],
      flags: 1 << 6
    });
  }

  // STEP B: Mention Role
  if (customId === 'conf_B') {
    const roleOptions = interaction.guild.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => ({
        label: role.name,
        value: role.id
      }))
      .slice(0, 25);

    return interaction.reply({
      content: '📣 Select a mention role:',
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_mention_role',
              placeholder: 'Choose a role...',
              options: roleOptions
            }
          ]
        }
      ],
      flags: 1 << 6
    });
  }

  // Handle Select Menus
  if (interaction.isSelectMenu()) {
    // Handle Registration Channel selection
    if (interaction.customId === 'select_reg_channel') {
      const selectedChannelId = interaction.values[0];
      setup.registrationChannel = selectedChannelId;
      await setup.save();

      return interaction.update({
        content: `✅ Registration channel set to <#${selectedChannelId}>.`,
        components: []
      });
    }

    // Handle Mention Role selection
    if (interaction.customId === 'select_mention_role') {
      const selectedRoleId = interaction.values[0];
      setup.mentionRole = selectedRoleId;
      await setup.save();

      return interaction.update({
        content: `✅ Mention role set to <@&${selectedRoleId}>.`,
        components: []
      });
    }
  }
};
