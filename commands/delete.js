import TicketLog from "../schemas/ticketLog.js";

export default {
    data: {
        name: ['delete']
    },
    async execute(message) {
        const args = message.content.split(' ');
        args.shift(); // Remove command name
        const messageNumber = parseInt(args[0], 10); // Ensure it's a number

        // Ensure correct usage
        if (!args.length || isNaN(messageNumber)) {
            message.channel.send('Usage: !delete <messageNumber>');
            return;
        }

        // Find the current ticket
        const ticket = await TicketLog.findOne({ user_id: message.channel.topic, ticket_type: process.env.BOT_TYPE, open: true });
        if (!ticket) {
            message.channel.send('No open ticket found for this channel.');
            return;
        }

        // Validate message number argument
        const staffMessages = ticket.messages.filter(msg => msg.message_number !== undefined);
        if (messageNumber < 1 || messageNumber > staffMessages.length) {
            message.channel.send('Invalid message number.');
            return;
        }
        const messageData = ticket.messages.find(msg => msg.message_number == messageNumber);
        if (!messageData) {
            message.channel.send('Message number not found.');
            return;
        }

        // Find user
        let user = await message.client.users.cache.get(ticket.user_id);
        if (!user) {
            user = await message.client.users.fetch(ticket.user_id);
        }
        if (!user.dmChannel) {
            await user.createDM();
        }

        const userMessageId = messageData.user_message_id;
        const staffMessageId = messageData.staff_message_id;

        try {
            // Find the message on both sides
            let userMessage = await user.dmChannel.messages.cache.get(userMessageId);
            if (!userMessage) {
                userMessage = await user.dmChannel.messages.fetch(userMessageId);
            }
            let staffMessage = await message.channel.messages.cache.get(staffMessageId);
            if (!staffMessage) {
                staffMessage = await message.channel.messages.fetch(staffMessageId);
            }

            // Update the ticket log showing a message was deleted
            ticket.messages.push({
                username: message.author.username,
                message: `Deleted message #${messageNumber}`,
            });
            await ticket.save();

            // Delete the message on both sides
            await userMessage.delete();
            await staffMessage.delete();
            message.channel.send('Message deleted successfully.');
        } catch (error) {
            console.error(error);
            message.channel.send('Failed to delete the message.');
        }
    }
}