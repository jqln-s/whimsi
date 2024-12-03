import { PermissionFlagsBits } from 'discord.js';
import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['log'],
        permission: PermissionFlagsBits.ViewAuditLog,
        deleteMessage: true,
        whitelistedChannelIDs: ['1298122953401176165']
    },
    async execute(message) {
        try {
            // Parse command arguments and validate input
            const args = message.content.split(' ').slice(1); // Remove command name
            const ticketID = args[0];

            if (!ticketID) {
                return message.channel.send('Please provide a ticket ID. Usage: `!log <ticketID>`');
            }

            // Fetch the ticket log from the database
            const log = await TicketLog.findById(ticketID);
            if (!log) {
                return message.channel.send('Ticket log not found.');
            }

            // Build the log content
            let logText = '';
            log.messages.forEach(msg => {
                const timestamp = new Date(msg.timestamp).toLocaleString();
                const messageNumber = msg.message_number ? `#${msg.message_number}` : '-';
                if (msg.anonymous) {
                    logText += `[${timestamp}] ${messageNumber} [${msg.username} (Anon)]: ${msg.message}\n`;
                } else {
                    logText += `[${timestamp}] ${messageNumber} [${msg.username}]: ${msg.message}\n`;
                }
            });

            if (!logText) {
                return message.channel.send('This ticket contains no messages.');
            }

            // Create a file buffer for the log
            const attachment = Buffer.from(logText, 'utf-8');

            // Send the log as a file attachment
            await message.channel.send({
                files: [{
                    attachment,
                    name: `${ticketID}-log.txt`
                }]
            });

        } catch (error) {
            console.error('Error while fetching or sending ticket log:', error);
            message.channel.send('An error occurred while fetching the ticket log.');
        }
    }
};