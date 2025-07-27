require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const interactionCreate = require('./events/interactionCreate');
client.on('interactionCreate', interaction => interactionCreate(interaction, client));

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!rzsetup') {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const panel = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('create_scrim').setLabel('🟢 Create Scrim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('edit_scrim').setLabel('🟣 Edit Settings').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('toggle_reg').setLabel('✅ Start/Stop Registration').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('manage_slotlist').setLabel('📂 Manage Slotlist').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('reserve_slots').setLabel('📌 Reserve Slots').setStyle(ButtonStyle.Secondary),
    );

    const panel2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ban_unban').setLabel('🚫 Ban/Unban').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('enable_disable_scrim').setLabel('🔄 Enable/Disable').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('design_scrim').setLabel('🎨 Design').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('drop_location').setLabel('🗺️ Drop Location').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('scrim_help').setLabel('❓ Help').setStyle(ButtonStyle.Secondary),
    );

    await message.channel.send({
      content: `🛠️ **Scrim Setup Panel**
Use the buttons below to manage your scrim.`,
      components: [panel, panel2]
    });
  }
});

client.login(process.env.DISCORD_TOKEN);