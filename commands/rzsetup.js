const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require('discord.js');

module.exports = {
  name: 'rzsetup',
  description: 'Initialize scrim setup for this server',
  async execute(message, args, client) {
    // ✅ Check for admin permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You must be an administrator to use this command.');
    }

    // 🧱 Embed for Setup Panel
    const embed = new EmbedBuilder()
      .setTitle('🛠️ RegiZen Scrim Control Panel')
      .setDescription('Click **Setup Scrims** to start configuring your scrim settings.\n\nYou can later manage:\n• Registration Channel\n• Roles\n• Slot Count\n• Open Time\n• Reactions\nAnd more...')
      .setFooter({ text: 'RegiZen • Scrim Setup' })
      .setColor('#00b0f4');

    // 🟢 Button Row
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup_scrims')
        .setLabel('✅ Setup Scrims')
        .setStyle(ButtonStyle.Success)
    );

    // ⏳ Send setup panel
    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
