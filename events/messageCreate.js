module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);
    if (command) {
      try {
        await command.execute(message, args, client);
      } catch (err) {
        console.error(err);
        message.reply('⚠️ There was an error executing that command.');
      }
    }
  }
};
