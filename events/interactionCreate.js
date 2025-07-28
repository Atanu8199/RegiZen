const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const ScrimSetup = require('../models/ScrimSetup');

module.exports = async (interaction, client) => {
  if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

  const { guildId, customId } = interaction;

  console.log("Interaction Triggered:", customId);

  let setup = await ScrimSetup.findOne({ guildId }) || new ScrimSetup({ guildId });

  // Main Scrim Setup Panel
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

  // A: Select Registration Channel
  if (customId === 'conf_A') {
    const options = interaction.guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({ label: `#${c.name}`, value: c.id }))
      .slice(0, 25);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_reg_channel')
      .setPlaceholder('Choose a registration channel...')
      .addOptions(options);

    return interaction.reply({
      content: '📥 Select a registration channel:',
      ephemeral: true,
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }

  if (interaction.isSelectMenu() && customId === 'select_reg_channel') {
    const selectedChannelId = interaction.values[0];
    setup.registrationChannel = selectedChannelId;
    await setup.save();

    return interaction.update({
      content: `✅ Registration channel set to <#${selectedChannelId}>.`,
      components: []
    });
  }

  // B: Mention Role
  if (customId === 'conf_B') {
    const roleOptions = interaction.guild.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => ({ label: role.name, value: role.id }))
      .slice(0, 25);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_mention_role')
      .setPlaceholder('Select a role to mention')
      .addOptions(roleOptions);

    return interaction.reply({
      content: '🔔 Select a role to mention during registration:',
      ephemeral: true,
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }

  if (interaction.isSelectMenu() && customId === 'select_mention_role') {
    const selectedRoleId = interaction.values[0];
    setup.mentionRole = selectedRoleId;
    await setup.save();

    return interaction.update({
      content: `✅ Mention role set to <@&${selectedRoleId}>.`,
      components: []
    });
  }

  // C: Total Slots
  if (customId === 'conf_C') {
    const modal = new ModalBuilder()
      .setCustomId('set_total_slots')
      .setTitle('C️⃣ Set Total Slots');

    const slotInput = new TextInputBuilder()
      .setCustomId('total_slots_input')
      .setLabel('Enter total slots (max 25)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(slotInput));

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && customId === 'set_total_slots') {
    const input = interaction.fields.getTextInputValue('total_slots_input');
    const totalSlots = parseInt(input);

    if (isNaN(totalSlots) || totalSlots < 1 || totalSlots > 25) {
      return interaction.reply({
        content: '❌ Please enter a valid number between 1 and 25.',
        ephemeral: true
      });
    }

    setup.totalSlots = totalSlots;
    await setup.save();

    return interaction.reply({
      content: `✅ Total slots set to **${totalSlots}**.`,
      ephemeral: true
    });
  }

  // D: Tag Count Required
  if (customId === 'conf_D') {
    const modal = new ModalBuilder()
      .setCustomId('set_tag_count')
      .setTitle('D️⃣ Set Tag Count Required');

    const tagInput = new TextInputBuilder()
      .setCustomId('tag_count_input')
      .setLabel('Enter tag count (1 to 4)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(1);

    modal.addComponents(new ActionRowBuilder().addComponents(tagInput));

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && customId === 'set_tag_count') {
    const input = interaction.fields.getTextInputValue('tag_count_input');
    const tagCount = parseInt(input);

    if (isNaN(tagCount) || tagCount < 1 || tagCount > 4) {
      return interaction.reply({
        content: '❌ Please enter a valid tag count between 1 and 4.',
        ephemeral: true
      });
    }

    setup.tagCount = tagCount;
    await setup.save();

    return interaction.reply({
      content: `✅ Tag count set to **${tagCount}**.`,
      ephemeral: true
    });
  }
};
