import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['reply', 'r']
    },
    async execute(message) {
        const mainServer = message.client.guilds.cache.get(process.env.GUILD_ID);

        // Get the response message
        const args = message.content.split(' ');
        args.shift();
        const response = args.join(' ');
        
        // Retrieve the user associated with the ticket channel (stored in the channel's topic)
        let user = message.client.users.cache.get(message.channel.topic);
        if (!user) {
            user = await mainServer.members.fetch(message.channel.topic);
        }

        // Specify message number for future reference
        const ticket = await TicketLog.findOne({ user_id: message.channel.topic, ticket_type: process.env.BOT_TYPE, open: true });
        const staffMessages = ticket.messages.filter(msg => msg.message_number != undefined);
        const messageNumber = staffMessages.length > 0 ? staffMessages[staffMessages.length - 1].message_number + 1 : 1;
        
        // Send the response to the user (mentioning the user and including the response)
        const userMessage = await user.send(`**[${message.member.roles.highest.name}]** <@${message.author.id}>: ${response}`);

        // Reply to the interaction with the same response, visible to the user who executed the command
        const staffMessage = await message.channel.send(`\`${messageNumber}\` **${message.author.username}**: ${response}`);

        // Push reply to ticket log
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
                            staff_message_id: staffMessage.id
                        }
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );
        } catch (error) {
            console.error('Error while updating ticket log: ' + error);
        }
    }        
}