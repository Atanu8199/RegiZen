module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    console.log('📨 messageCreate event fired');

    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);
    if (!command) return;

    console.log(`⚙️ Running command: ${command.name} by ${message.author.username}`);

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(err);
      message.reply('⚠️ There was an error executing that command.');
    }
  }
};
