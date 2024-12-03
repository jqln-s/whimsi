import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['logs'],
        permission: PermissionFlagsBits.ViewAuditLog,
        deleteMessage: true,
        whitelistedChannelIDs: ['1298122953401176165', '869889176441593876']
    },
    async execute(message) {
        // Split the message content and remove the command part
        const args = message.content.split(' ').slice(1); // Shift removes command name

        const user_id = args[0]; // Extract user ID from the arguments

        // Validate the user ID argument
        if (!user_id) {
            return message.channel.send('Usage: `!logs <userID>`');
        }

        let user;

        try {
            // Fetch the user from the cache or directly from Discord API if not cached
            user = message.client.users.cache.get(user_id);
            if (!user) {
                user = await message.client.users.fetch(user_id);
            }

            if (!user) {
                return message.channel.send(`User with ID \`${user_id}\` not found.`);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return message.channel.send('An error occurred while fetching the user.');
        }

        let ticketLogs = [];

        try {
            // Fetch the closed tickets for the given user
            const docs = await TicketLog.find({ user_id, open: false });
            if (docs.length === 0) {
                return message.channel.send(`No logs found for <@${user_id}>.`);
            }

            // Format logs with the necessary details
            ticketLogs = docs.map(doc => ({
                _id: doc._id,
                timestamp: doc.messages[0].timestamp,
                type: doc.ticket_type
            }));

            // Sort logs by timestamp in descending order
            ticketLogs.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error fetching ticket logs:', error);
            return message.channel.send('An error occurred while fetching the ticket logs.');
        }

        // Build the fields for the embed
        const logFields = ticketLogs.map(log => ({
            name: log.type,
            value: `<t:${Math.floor(log.timestamp / 1000)}:f>:\nView log with \`!log ${log._id}\``
        }));

        // Create the embed message to display the log files
        const embed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .addFields(logFields)
            .setTimestamp();

        // Send the embed with the list of logs
        message.channel.send({ content: `**Log files for <@${user_id}>**:`, embeds: [embed] });
    }
};