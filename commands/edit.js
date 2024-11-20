import TicketLog from "../schemas/ticketLog.js";

export default {
    data: {
        name: ['edit']
    },
    async execute(message) {
        const args = message.content.split(' ');
        args.shift(); // Remove command name
        const messageNumber = parseInt(args[0], 10); // Ensure it's a number
        args.shift(); // Remove message number
        const newMessage = args.join(' ');

        // Ensure correct usage
        if (!args.length || isNaN(messageNumber) || newMessage.length < 1) {
            message.channel.send('Usage: !edit <messageNumber> <newMessage>');
            return;
        }

        // Find the current ticket
        const ticket = await TicketLog.findOne({ user_id: message.channel.topic, open: true });
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
            await user.createDM(true);
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

            // Update the ticket log showing a message was edited
            ticket.messages.push({
                username: message.author.username,
                message: `Edited message #${messageNumber}: ${newMessage}`,
            });
            await ticket.save();

            // Edit the message on both sides
            await userMessage.edit(`**[${message.member.roles.highest.name}]** <@${message.author.id}>: ${newMessage}`);
            await staffMessage.edit(`\`${messageData.message_number}\` **${message.author.username}**: ${newMessage}`);
        } catch (error) {
            console.error(error);
            message.channel.send('Failed to edit the message.');
        }
    }
}