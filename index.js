require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

// Init Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});

// Slash command loader (optional if you use slash)
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Event loader
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  client.on(event.name, (...args) => event.execute(...args, client));
}

// ✅ PREFIX COMMAND: !RZSETUP
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!rzsetup') {
    try {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_scrim')
          .setLabel('Create Scrim')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('edit_scrim')
          .setLabel('Edit Settings')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('toggle_reg')
          .setLabel('Start/Stop Registration')
          .setStyle(ButtonStyle.Secondary)
      );

      await message.channel.send({
        content: '🛠️ **Scrim Control Panel**',
        components: [row]
      });

      console.log('✅ !RZSETUP command used in:', message.guild.name);

    } catch (err) {
      console.error('❌ Error sending panel:', err);
      await message.reply('❌ Failed to send setup panel.');
    }
  }
});

// Login bot
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('❌ Discord login failed:', err);
});
