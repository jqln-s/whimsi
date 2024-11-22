import { EmbedBuilder } from 'discord.js';
import timeoutStore from '../util/timeoutStore.js';
import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['close', 'c'],
        deleteMessage: true
    },
    async execute(message) {
        try {
            // Extract and parse the timer argument
            const args = message.content.split(' ').slice(1);
            let timerInput = args[0] || '15m';
            let cooldown = parseInt(timerInput);
            let unit = 'second(s)';

            // Check for existing timeout
            if (timeoutStore.getTimeoutID(message.channel.id)) {
                return message.channel.send('Ticket is already closing!');
            }

            // Determine cooldown in milliseconds based on suffix (m = minutes, h = hours)
            if (timerInput.toLowerCase().endsWith('m')) {
                cooldown *= 1000 * 60; // Convert to milliseconds
                unit = 'minute(s)';
            } else if (timerInput.toLowerCase().endsWith('h')) {
                cooldown *= 1000 * 60 * 60; // Convert to milliseconds
                unit = 'hour(s)';
            } else {
                cooldown *= 1000; // Default to seconds
            }

            // Validate cooldown value
            if (isNaN(cooldown) || cooldown <= 0) {
                return message.channel.send('Invalid timer format');
            }

            // Prepare embeds for closure notification
            const thumbnailEmbed = new EmbedBuilder()
                .setColor(0x69e7e6)
                .setImage('https://i.imgur.com/by0LvlK.png');

            const userEmbed = new EmbedBuilder()
                .setColor(0x69e7e6)
                .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆')
                .setDescription(
                    `This ticket has been **closed** by <@${message.author.id}>.\n\n` +
                    'If you have further concerns, you can create a new ticket by messaging this bot again.'
                )
                .setImage('https://i.imgur.com/LRS6uCl.png');

            // Notify users about the impending ticket closure
            message.channel.send(
                `Ticket closing in ${parseInt(timerInput)} ${unit}. ` +
                'Use `!cancel` to abort the ticket closing process.'
            );

            const channel = message.channel;
            const user = await message.client.users.cache.get(channel.topic) || 
                         await message.client.users.fetch(channel.topic).catch(() => null);

            // Schedule ticket closure
            const timeoutID = setTimeout(async () => {
                try {
                    if (!user) {
                        console.error(`User not found.`);
                    } else {
                        await user.send({ embeds: [thumbnailEmbed, userEmbed] });
                    }

                    await channel.delete(); // Delete the ticket channel

                    // Update the ticket log in the database
                    await TicketLog.findOneAndUpdate(
                        {
                            user_id: channel.topic,
                            ticket_type: process.env.BOT_TYPE,
                            open: true
                        },
                        {
                            open: false
                        }
                    );
                } catch (error) {
                    console.error('Error during ticket closure:', error);
                }
            }, cooldown);

            // Store the timeout ID for potential cancellation
            timeoutStore.setTimeoutID(channel.id, timeoutID);
        } catch (error) {
            console.error('Error executing close command:', error);
            message.channel.send('An error occurred while processing the ticket closure.');
        }
    }
};