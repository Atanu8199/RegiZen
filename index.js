require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, Events } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ✅ MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// 🔁 Load Event: interactionCreate
const interactionHandler = require('./events/interactionCreate');
client.on(Events.InteractionCreate, (interaction) => interactionHandler(interaction, client));

// ✅ Ready Message
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ✅ MessageCommand: !rzsetup Panel
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content.toLowerCase() === '!rzsetup') {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

    const embed = new EmbedBuilder()
      .setTitle('Enter details & Press Save')
      .setDescription('Scrim Creation is a piece of cake through dashboard, [Click Me](https://example.com)')
      .addFields(
        { name: '🅰 Reg. Channel:', value: 'Not–Set', inline: true },
        { name: '🅱 Slotlist Channel:', value: 'Not–Set', inline: true },
        { name: '🇨 Success Role:', value: 'Not–Set', inline: true },
        { name: '🇩 Req. Mentions:', value: '4', inline: true },
        { name: '🇪 Total Slots:', value: 'Not–Set', inline: true },
        { name: '🇫 Open Time:', value: 'Not–Set', inline: true },
        { name: '🇬 Scrim Days:', value: 'Mo, Tu, We, Th, Fr, Sa, Su', inline: true },
        { name: '🇭 Reactions:', value: '✅, ❌', inline: true }
      )
      .setColor('Blue');

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('set_reg_channel').setLabel('A').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('set_slot_channel').setLabel('B').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('set_success_role').setLabel('C').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('set_mentions').setLabel('D').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('set_total_slots').setLabel('E').setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('set_open_time').setLabel('F').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('set_scrim_days').setLabel('G').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('set_reactions').setLabel('H').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('cancel_scrim').setLabel('Cancel').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('save_scrim').setLabel('Save Scrim').setStyle(ButtonStyle.Success)
    );

    const msg = await message.channel.send({
      embeds: [embed],
      components: [row1, row2]
    });

    // Save message ID for future updates
    const ScrimSetup = require('./models/ScrimSetup');
    let setup = await ScrimSetup.findOne({ guildId: message.guild.id });
    if (!setup) {
      setup = await ScrimSetup.create({ guildId: message.guild.id });
    }
    setup.messageId = msg.id;
    await setup.save();
  }
});

// ✅ Login
client.login(process.env.DISCORD_TOKEN);
