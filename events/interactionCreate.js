const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");
const ScrimSetup = require("../models/ScrimSetup");

module.exports = async (interaction, client) => {
  if (!interaction.isButton()) return;

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
      scrimDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      reactions: ["✅", "❌"],
      messageId: null,
    });
  }

  switch (customId) {
    case "create_scrim":
      await updateScrimEmbed(channel, setup);
      await interaction.reply({
        content: "📋 Scrim setup panel loaded below.",
        ephemeral: true,
      });
      break;

    case "edit_scrim":
    case "toggle_reg":
    case "manage_slotlist":
    case "reserve_slots":
    case "ban_unban":
    case "enable_disable_scrim":
    case "design_scrim":
    case "drop_location":
      await interaction.reply({
        content: `Feature coming soon for: ${customId}`,
        ephemeral: true,
      });
      break;

    case "scrim_help":
      await interaction.reply({
        content: "❓ Help clicked! Use buttons A–H to configure scrim.",
        ephemeral: true,
      });
      break;

    case "set_reg_channel":
      await interaction.reply({
        content: "📢 Mention the registration channel now.",
        ephemeral: true,
      });
      await collectUserChannel(interaction, channel, setup, "regChannel");
      break;

    case "cancel_scrim":
      await interaction.update({
        content: "❌ Scrim creation cancelled.",
        embeds: [],
        components: [],
      });
      break;

    case "save_scrim":
      await interaction.reply({
        content: "✅ Scrim settings saved successfully.",
        ephemeral: true,
      });
      break;
  }
};

async function collectUserChannel(interaction, channel, setup, fieldName) {
  const filter = (m) => m.author.id === interaction.user.id;
  try {
    const collected = await channel.awaitMessages({ filter, max: 1, time: 30000 });
    const userMsg = collected.first();
    const mentionedChannel = userMsg.mentions.channels.first();

    if (!mentionedChannel || mentionedChannel.type !== ChannelType.GuildText) {
      await userMsg.reply("❌ Invalid channel. Mention a proper #text-channel.");
      return;
    }

    setup[fieldName] = mentionedChannel.id;
    await setup.save();
    await updateScrimEmbed(channel, setup);
  } catch (err) {
    console.error("Error collecting user input:", err);
  }
}

async function updateScrimEmbed(channel, setup) {
  const embed = new EmbedBuilder()
    .setTitle("Enter details & Press Save")
    .setDescription("Scrim Creation is a piece of cake through dashboard, [Click Me](https://example.com)")
    .addFields(
      { name: "🅰 Reg. Channel:", value: setup.regChannel ? `<#${setup.regChannel}>` : "Not–Set", inline: true },
      { name: "🅱 Slotlist Channel:", value: setup.slotlistChannel ? `<#${setup.slotlistChannel}>` : "Not–Set", inline: true },
      { name: "🇨 Success Role:", value: setup.successRole ? `<@&${setup.successRole}>` : "Not–Set", inline: true },
      { name: "🇩 Req. Mentions:", value: `${setup.mentionsRequired}`, inline: true },
      { name: "🇪 Total Slots:", value: setup.totalSlots ? `${setup.totalSlots}` : "Not–Set", inline: true },
      { name: "🇫 Open Time:", value: setup.openTime || "Not–Set", inline: true },
      { name: "🇬 Scrim Days:", value: setup.scrimDays.length ? setup.scrimDays.join(", ") : "Mo, Tu, We, Th, Fr, Sa, Su", inline: true },
      { name: "🇭 Reactions:", value: setup.reactions.join(", "), inline: true }
    )
    .setColor("Blue");

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("set_reg_channel").setLabel("A").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("set_slot_channel").setLabel("B").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("set_success_role").setLabel("C").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("set_mentions").setLabel("D").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("set_total_slots").setLabel("E").setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("set_open_time").setLabel("F").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("set_scrim_days").setLabel("G").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("set_reactions").setLabel("H").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("cancel_scrim").setLabel("Cancel").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("save_scrim").setLabel("Save Scrim").setStyle(ButtonStyle.Success)
  );

  try {
    if (setup.messageId) {
      const oldMsg = await channel.messages.fetch(setup.messageId);
      await oldMsg.edit({ embeds: [embed], components: [row1, row2] });
    } else {
      const msg = await channel.send({ embeds: [embed], components: [row1, row2] });
      setup.messageId = msg.id;
      await setup.save();
    }
  } catch (err) {
    console.error("❌ Embed update failed:", err.message);
  }
}
