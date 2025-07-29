const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// ✅ Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// ✅ Load all commands from /commands folder
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// ✅ Load all events from /events folder
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ✅ Manually handle interactionCreate for buttons, modals, selects
client.on('interactionCreate', interaction => {
  require('./events/interactionCreate')(interaction, client);
});

// ✅ Manually handle messageCreate for user registrations
client.on('messageCreate', message => {
  require('./events/messageCreate')(message, client);
});

// ✅ Connect to MongoDB and start bot
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('🟢 Connected to MongoDB');

  // ✅ Login bot
  client.login(process.env.TOKEN);

  // ✅ Start scheduler (open channels at scheduled registration times)
  const scheduler = require('./scheduler');
  scheduler(client);
})
.catch(err => console.error('🔴 MongoDB connection error:', err));
