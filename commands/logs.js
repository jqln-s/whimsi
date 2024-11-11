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
            return message.reply('Usage: !logs <user_id>');
        }

        let ids = [];

        try {
            // Fetch closed ticket logs for the given user
            const docs = await TicketLog.find({ user_id, open: false });
            if (docs.length === 0) {
                // No logs found for the user
                return message.reply(`No logs found for <@${user_id}>.`);
            } else {
                // Map the results to extract relevant info (log ID and timestamp)
                ids = docs.map(doc => ({
                    _id: doc._id,
                    timestamp: doc.messages[0].timestamp
                }));
            }
        } catch (error) {
            console.error('Error while fetching ticket log: ' + error);
        }
        
        // Build a string of log file references
        let txt = '';
        ids.forEach(pair => {
            txt += `\`${pair.timestamp.toLocaleString()}\`: View log with \`!log ${pair._id}\`\n`;
        });

        // Send the log file references as a message
        message.channel.send(`**Log files for <@${user_id}>:**\n${txt}`);
    }
}