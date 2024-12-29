import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['accept', 'acc', 'yes'],
        deleteMessage: true,
        botType: 'Applications'
    },
    async execute(message) {
        const mainServer = message.client.guilds.cache.get(process.env.GUILD_ID);

        const response = 'After reviewing your application we have decided to invite you to an interview! Please give your availability over the next week using https://sesh.fyi/timestamp/';

        // Retrieve the user associated with the ticket channel (stored in the channel's topic)
        let user = message.client.users.cache.get(message.channel.topic);
        if (!user) {
            try {
                user = await mainServer.members.fetch(message.channel.topic);
            } catch (error) {
                console.error('Error fetching user from server:', error);
                return message.channel.send('Failed to find the user for this ticket.');
            }
        }

        // Retrieve the ticket log and ensure the ticket exists
        const ticket = await TicketLog.findOne({ user_id: message.channel.topic, ticket_type: process.env.BOT_TYPE, open: true });
        if (!ticket) {
            return message.channel.send('No open ticket found for this channel.');
        }

        // Generate the next message number for the ticket
        const staffMessages = ticket.messages.filter(msg => msg.message_number !== undefined);
        const messageNumber = staffMessages.length > 0 ? staffMessages[staffMessages.length - 1].message_number + 1 : 1;
        
        // Send the response to the user (mentioning the user and including the response)
        let userMessage;
        try {
            userMessage = await user.send(`**[${message.member.roles.highest.name}]** <@${message.author.id}>: ${response}`);
        } catch (error) {
            console.error('Error sending message to user:', error);
            return message.channel.send('Failed to send the response to the user.');
        }

        // Reply to the interaction in the channel, visible to staff
        let staffMessage;
        try {
            staffMessage = await message.channel.send(`\`${messageNumber}\` **${message.author.username}**: ${response}`);
        } catch (error) {
            console.error('Error sending message to staff channel:', error);
            return message.channel.send('Failed to send the response in the staff channel.');
        }

        // Push the reply to the ticket log
        try {
            await TicketLog.findOneAndUpdate(
                {
                    user_id: message.channel.topic,
                    ticket_type: process.env.BOT_TYPE,
                    open: true
                },
                {
                    $push: {
                        messages: {
                            username: message.author.username,
                            message: response,
                            message_number: messageNumber,
                            user_message_id: userMessage.id,
                            staff_message_id: staffMessage.id,
                            anonymous: false
                        }
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );
        } catch (error) {
            console.error('Error while updating ticket log:', error);
            return message.channel.send('Failed to update the ticket log, but your message has been sent. This means you cannot edit or delete this message.');
        }
    }
}