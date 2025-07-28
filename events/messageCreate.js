// events/messageCreate.js
module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      console.log(`⚙️ Running command: ${commandName} by ${message.author.tag}`);
      await command.execute(message, args, client);
    } catch (error) {
      console.error('❌ Command Error:', error);
      await message.reply('There was an error executing that command.');
    }
  }
};
