const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

function createScrimModal() {
  const modal = new ModalBuilder()
    .setCustomId('create_scrim_modal')
    .setTitle('🟢 Create Scrim');

  const regChannel = new TextInputBuilder()
    .setCustomId('reg_channel')
    .setLabel('Registration Channel ID (#channel)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const mentionRole = new TextInputBuilder()
    .setCustomId('mention_role')
    .setLabel('Mention Role ID (@BGMI)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const totalSlots = new TextInputBuilder()
    .setCustomId('total_slots')
    .setLabel('Total Slots (e.g. 25)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const teamTags = new TextInputBuilder()
    .setCustomId('team_tags')
    .setLabel('Required Team Tags (1–4)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const regTime = new TextInputBuilder()
    .setCustomId('reg_time')
    .setLabel('Registration Open Time (e.g. 12:30 PM)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(regChannel),
    new ActionRowBuilder().addComponents(mentionRole),
    new ActionRowBuilder().addComponents(totalSlots),
    new ActionRowBuilder().addComponents(teamTags),
    new ActionRowBuilder().addComponents(regTime)
  );

  return modal;
}

module.exports = createScrimModal;
