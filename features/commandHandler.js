import { Events } from 'discord.js';

export default async (client) => {
    client.on(Events.MessageCreate, async (message) => {
        // Ignore messages that don't start with '!', are from bots, or aren't in the specified channel category
        if (!message.content.startsWith('!') || message.author.bot || message.channel.parentId !== process.env.CATEGORY_ID) return;

        // Split message content into arguments and parse the command name (e.g., "!Command" becomes "command")
        const args = message.content.slice(1).split(' ');
        const commandName = args.shift().toLowerCase();

        // Look up the command from the client's collection of commands
        const command = client.commands.find(cmd => cmd.data.name.some(name => name === commandName));

        if (!command) return;  // Exit if the command is not found

        // Check for permissions
        if (command.data.permission && !message.member.permissions.has(command.data.permission)) {
            return message.reply(`You do not have permission to use the \`${commandName}\` command. Required permission: \`${command.data.permission}\``);
        }

        try {
            // Attempt to execute the command with the given message
            await command.execute(message);

            // Optionally delete the original command message
            if (command.data.deleteMessage !== false) {
                await message.delete();
            }
        } catch (error) {
            console.error(`Error executing command "${commandName}":`, error);
            message.reply(`There was an error while executing the \`${commandName}\` command!`);
        }
    });
};