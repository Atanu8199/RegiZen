module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Your prefix
    const prefix = '!';

    // Check if message starts with prefix
    if (!message.content.startsWith(prefix)) return;

    // Split command and args
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check for RZSETUP
    if (commandName === 'rzsetup') {
      const command = client.commands.get('setup'); // 🟢 'setup.js' file
      if (command) {
        try {
          await command.execute(message, args, client);
        } catch (error) {
          console.error('❌ Error executing rzsetup:', error);
          await message.reply('❌ Something went wrong while running the command.');
        }
      }
    }
  }
};
