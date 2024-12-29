import { Events } from 'discord.js';

export default async (client) => {
    client.on(Events.MessageCreate, async (message) => {
        // Ignore messages that don't start with '!' or are from bots
        if (!message.content.startsWith('!') || message.author.bot) return;

        // Split message content into arguments and parse the command name (e.g., "!Command" becomes "command")
        const args = message.content.slice(1).split(' ');
        const commandName = args.shift().toLowerCase();

        // Look up the command from the client's collection of commands
        const command = client.commands.find(cmd => cmd.data.name.some(name => name === commandName));

        if (!command) return;  // Exit if the command is not found

        // Exit if incorrect bot is used
        if (command.data.botType && command.data.botType !== process.env.BOT_TYPE) return;

        // Check for permissions
        if (command.data.permission && !message.member.permissions.has(command.data.permission)) {
            return message.reply(`You do not have permission to use the \`${commandName}\` command. Required permission: \`${command.data.permission}\``);
        }

        // Check for correct channel usage
        if (message.channel.parentId != process.env.CATEGORY_ID) {
            // Commands executed in whitelisted channels can only be responded to by the General bot
            if (process.env.BOT_TYPE != 'General') return;

            let isWhitelisted = false;

            // Check whitelisted channels
            if (command.data.whitelistedChannelIDs) {
                for (const channelID of command.data.whitelistedChannelIDs) {
                    if (message.channel.id === channelID) {
                        isWhitelisted = true;
                        break;
                    }
                }
            }

            // Exit if channel is not whitelisted
            if (!isWhitelisted) {
                return;
            }
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