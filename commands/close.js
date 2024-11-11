import { EmbedBuilder } from 'discord.js';
import timeoutStore from '../util/timeoutStore.js'
import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['close']
    },
    async execute(message) {
        // Get the timer option 
        const args = message.content.split(' ');
        args.shift();
        let timer = args[0] || '10s';
        
        // Validate and parse the timer, defaulting to '10 seconds'
        timer = parseInt(timer) ? timer : '10s';
        let cooldown = parseInt(timer);
        let unit = 'second(s)';
            
        // Adjust cooldown based on the unit provided (m = minutes, h = hours)
        if (timer.toLowerCase().endsWith('m')) {
            cooldown = cooldown * 1000 * 60;  // Convert to milliseconds
            unit = 'minute(s)';
        } else if (timer.toLowerCase().endsWith('h')) {
            cooldown = cooldown * 1000 * 60 * 60;  // Convert to milliseconds
            unit = 'hour(s)';
        } else {
            cooldown = cooldown * 1000;  // Default to seconds
        }
        
        // Prepare embed message for the ticket close notification
        const thumbnailEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setImage('https://i.imgur.com/by0LvlK.png');
        
        const userEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
            .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆')
            .setDescription(
                `This ticket has been **closed** by <@${message.author.id}>.\n\n` +
                'If you have any other concerns, you can make a new ticket by dming this bot again.')
            .setImage('https://i.imgur.com/LRS6uCl.png');
        
        // Inform the user about the time left before the ticket closes and how to cancel
        message.reply(
            `Ticket closing in ${parseInt(timer)} ${unit}...
            \nUse \`!cancel\` to cancel the ticket closing.`
        );

        // Set up a timeout to delete the ticket and send the closure message after the cooldown
        let timeoutID = setTimeout(async () => {
            message.channel.delete();  // Delete the ticket channel
        
            // Send the closure notification to the user (if they can be found)
            try {
                const user = message.client.users.cache.get(message.channel.topic);
                user.send({ embeds: [thumbnailEmbed, userEmbed] });
            } catch (error) {
                console.error(error);
            }

            // Find the ticket log in the database and mark it as closed
            try {
                await TicketLog.findOneAndUpdate(
                    {
                        user_id: message.channel.topic,
                        open: true
                    },
                    {
                        open: false
                    }
                );
            } catch (error) {
                console.error('Error while updating ticket log: ' + error);
            }
        }, cooldown);
        
        // Store the timeout ID associated with the channel's topic for future reference (e.g., cancel)
        timeoutStore.setTimeoutID(message.channel.topic, timeoutID);
    }
}