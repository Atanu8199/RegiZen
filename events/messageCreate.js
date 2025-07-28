module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const prefix = '!';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = client.commands.get(cmdName);
    if (!command) return;

    try {
      console.log(`⚙️ Running command: ${cmdName} by ${message.author.tag}`);
      await command.execute(message, args, client);
    } catch (err) {
      console.error(err);
      message.reply('❌ There was an error executing that command.');
    }
  }
};
