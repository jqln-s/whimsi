import { Events } from 'discord.js';

export default async (client) => {
    client.on(Events.MessageCreate, async (message) => {
        // Ignore messages that don't start with '!', are from bots, or aren't in the specified channel category
        if (!message.content.startsWith('!') || message.author.bot || message.channel.parentId != '1302439814007619678') return;
    
        // Split message content into arguments and parse the command name (e.g., "!Command" becomes "command")
        const args = message.content.split(' ');
        const commandName = args[0].substring(1).toLowerCase();
    
        // Look up the command from the client's collection of commands
        const command = message.client.commands.find(cmd => cmd.data.name.some(name => name === commandName));
    
        if (!command) return;  // Exit if the command is not found
    
        try {
            // Attempt to execute the command with the given message
            await command.execute(message);
        } catch (error) {
            console.error(error);
            message.reply('There was an error while executing this command!');
        }
    });
}