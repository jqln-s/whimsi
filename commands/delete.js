import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['delete'],
        deleteMessage: true
    },
    async execute(message) {
        try {
            // Parse and validate command arguments
            const args = message.content.split(' ').slice(1); // Remove the command name
            const messageNumber = parseInt(args[0], 10);

            if (!args.length || isNaN(messageNumber)) {
                return message.channel.send('Usage: `!delete <messageNumber>`');
            }

            // Fetch the ticket from the database
            const ticket = await TicketLog.findOne({
                user_id: message.channel.topic,
                ticket_type: process.env.BOT_TYPE,
                open: true
            });

            if (!ticket) {
                return message.channel.send('No open ticket found for this channel.');
            }

            // Validate the message number
            const staffMessages = ticket.messages.filter(msg => msg.message_number !== undefined);
            if (messageNumber < 1 || messageNumber > staffMessages.length) {
                return message.channel.send('Invalid message number.');
            }

            // Locate the specific message
            const messageData = staffMessages.find(msg => msg.message_number === messageNumber);
            if (!messageData) {
                return message.channel.send('Message not found.');
            }

            const { user_message_id, staff_message_id } = messageData;

            // Fetch the user
            let user = await message.client.users.cache.get(ticket.user_id);
            if (!user) {
                user = await message.client.users.fetch(ticket.user_id).catch(() => null);
            }

            if (!user || !user.dmChannel) {
                await user?.createDM().catch(() => null);
            }

            // Fetch messages on both sides
            const userMessagePromise = user?.dmChannel?.messages.fetch(user_message_id).catch(() => null);
            const staffMessagePromise = message.channel.messages.fetch(staff_message_id).catch(() => null);

            const [userMessage, staffMessage] = await Promise.all([userMessagePromise, staffMessagePromise]);

            if (!userMessage && !staffMessage) {
                return message.channel.send('Unable to find the specified messages.');
            }

            // Delete messages on both sides
            const deletePromises = [];
            if (userMessage) deletePromises.push(userMessage.delete());
            if (staffMessage) deletePromises.push(staffMessage.delete());

            await Promise.all(deletePromises);

            // Update the ticket log
            ticket.messages.push({
                username: message.author.username,
                message: `Deleted message #${messageNumber}`
            });

            await ticket.save();

            message.channel.send('Message deleted successfully.');
        } catch (error) {
            console.error('Error during message deletion:', error);
            message.channel.send('An error occurred while attempting to delete the message.');
        }
    }
};