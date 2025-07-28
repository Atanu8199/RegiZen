// events/messageCreate.js
module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    
    const prefix = '!!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, client);
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error executing that command.');
    }
  },
};
