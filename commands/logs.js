import { EmbedBuilder } from 'discord.js';
import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['logs']
    },
    async execute(message) {
        // Split the message into arguments and remove the command part
        const args = message.content.split(' ');
        args.shift();

        const user_id = args[0];  // Get the user ID from the argument

        // Try to fetch the user from the client cache or directly from Discord if not cached
        let user = message.client.users.cache.get(user_id);
        if (!user) {
            user = await message.client.users.fetch(user_id);
        }

        // If user isn't found, reply with usage instructions
        if (!user) {
            return message.channel.send('Usage: !logs <user_id>');
        }

        let ids = [];

        try {
            // Fetch closed ticket logs for the given user
            const docs = await TicketLog.find({ user_id, open: false });
            if (docs.length == 0) {
                // No logs found for the user
                return message.channel.send(`No logs found for <@${user_id}>.`);
            } else {
                // Map the results to extract relevant info (log ID and timestamp)
                ids = docs.map(doc => ({
                    _id: doc._id,
                    timestamp: doc.messages[0].timestamp,
                    type: doc.ticket_type
                }));
            }
        } catch (error) {
            console.error('Error while fetching ticket log: ' + error);
        }
        
        // Build an array of log file reference fields
        ids.sort((a, b) => b.timestamp - a.timestamp);
        let logs = [];
        ids.forEach(obj => {
            logs.push(
                {
                    name: obj.type,
                    value: `<t:${Math.floor(obj.timestamp / 1000)}>:\nView log with \`!log ${obj._id}\``
                }
            )
        });

        // Send the log file references as a message
        const embed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .addFields(logs);
        message.channel.send({ content: `**Log files for <@${user_id}>:**`, embeds: [embed] });
    }
}