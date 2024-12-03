import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['edit'],
        deleteMessage: true
    },
    async execute(message) {
        try {
            // Parse and validate command arguments
            const args = message.content.split(' ').slice(1); // Remove the command name
            const messageNumber = parseInt(args.shift(), 10);
            const newMessage = args.join(' ');

            if (!args.length || isNaN(messageNumber) || newMessage.length < 1) {
                return message.channel.send('Usage: `!edit <messageNumber> <newMessage>`');
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

            // Validate message number
            const staffMessages = ticket.messages.filter(msg => msg.message_number !== undefined);
            if (messageNumber < 1 || messageNumber > staffMessages.length) {
                return message.channel.send('Invalid message number.');
            }

            // Find the specific message data
            const messageData = staffMessages.find(msg => msg.message_number === messageNumber);
            if (!messageData) {
                return message.channel.send('Message not found.');
            }

            const { user_message_id, staff_message_id } = messageData;

            // Fetch the user associated with the ticket
            let user = await message.client.users.cache.get(ticket.user_id) || 
                       await message.client.users.fetch(ticket.user_id).catch(() => null);

            if (!user || !user.dmChannel) {
                await user?.createDM().catch(() => null);
            }

            // Fetch the user and staff messages concurrently
            const userMessagePromise = user?.dmChannel?.messages.fetch(user_message_id).catch(() => null);
            const staffMessagePromise = message.channel.messages.fetch(staff_message_id).catch(() => null);

            const [userMessage, staffMessage] = await Promise.all([userMessagePromise, staffMessagePromise]);

            if (!userMessage && !staffMessage) {
                return message.channel.send('Unable to find the specified messages.');
            }

            // Update the ticket log with the edited message
            ticket.messages.push({
                username: message.author.username,
                message: `Edited message #${messageNumber}: ${newMessage}`
            });
            await ticket.save();

            // Edit the messages on both sides
            const editPromises = [];
            if (userMessage) {
                if (messageData.anonymous) {
                    editPromises.push(userMessage.edit(newMessage));
                } else {
                    editPromises.push(userMessage.edit(`**[${message.member.roles.highest.name}]** <@${message.author.id}>: ${newMessage}`));
                }
            }
            if (staffMessage) {
                if (messageData.anonymous) {
                    editPromises.push(staffMessage.edit(newMessage));
                } else {
                    editPromises.push(staffMessage.edit(`\`${messageData.message_number}\` **${message.author.username}**: ${newMessage}`));
                }
            }

            await Promise.all(editPromises);

            message.channel.send('Message edited successfully.');
        } catch (error) {
            console.error('Error during message editing:', error);
            message.channel.send('Failed to edit the message.');
        }
    }
};